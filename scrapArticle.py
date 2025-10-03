import pandas as pd
import requests
from bs4 import BeautifulSoup
from pymongo import MongoClient
import time

# Step 1: Load dataset
csv_file = "SB_publication_PMC.csv"
df = pd.read_csv(csv_file)

# Step 2: Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")  # adjust if remote
db = client["ArticlesDB"]
collection = db["Articles"]

# Step 3: Headers to avoid 403 Forbidden
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/118.0.0.0 Safari/537.36"
}

# ===== Helper functions =====

def extract_sections_from_nav(soup, target_labels):
    """Map label -> data-anchor-id from in-page nav list."""
    sections = {}
    nav = soup.select_one("ul.usa-in-page-nav__list")
    if not nav:
        return sections
    for a in nav.find_all("a", attrs={"data-anchor-id": True, "data-ga-label": True}):
        label = a.get("data-ga-label", "").strip()
        anchor_id = a.get("data-anchor-id")
        if label in target_labels:
            sections[label] = anchor_id
    return sections

def get_section_text(soup, section_id):
    """
    Extract text for a section given its anchor id.
    Handles:
    - Abstract: <h2 data-anchor-id="abstract1"> + following <p>
    - Results/Conclusions: <section id="s3a">, <section id="s3b">, etc.
    """
    if not section_id:
        print("No Section ID provided")
        return None

    # Case 1: Abstract (header + following paragraphs until next h2)
    if section_id.startswith("abstract"):
        h2 = soup.find("h2", {"data-anchor-id": section_id})
        print(f"finding Abstract h2 is : {h2}")
        if h2:
            texts = []
            for sib in h2.find_all_next():
                if sib.name == "h2":  # stop at next section header
                    break
                if sib.name == "p":
                    texts.append(sib.get_text(strip=True))
            return " ".join(texts) if texts else None

    # Case 2: Results/Conclusions (multiple subsections s3a, s3b, s3c...)
    sections = soup.find_all("section", id=lambda x: x and x.startswith(section_id))
    if sections:
        texts = []
        for sec in sections:
            paragraphs = sec.find_all("p")
            texts.extend(p.get_text(strip=True) for p in paragraphs if p.get_text(strip=True))
        return " ".join(texts) if texts else None

    return None

def extract_authors(soup):
    # Use meta tags for reliability
    authors = [m.get("content") for m in soup.find_all("meta", {"name": "citation_author"}) if m.get("content")]
    return authors, len(authors)

def extract_pub_date(soup):
    meta_date = soup.find("meta", {"name": "citation_publication_date"})
    if meta_date:
        return meta_date.get("content")
    date_span = soup.find("span", class_="epub-date")
    return date_span.get_text(strip=True) if date_span else None

# ===== Main loop =====

for idx, row in df.iterrows():
    title = row["Title"]
    link = row["Link"]

    try:
        response = requests.get(link, headers=headers, timeout=15)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")

        # Get IDs from nav
        targets = ["Abstract", "Results and Discussion", "Conclusions"]
        nav_map = extract_sections_from_nav(soup, targets)

        # Extract sections dynamically
        abstract = get_section_text(soup, nav_map.get("Abstarct"))
        results = get_section_text(soup, nav_map.get("Results and Discussion"))
        conclusion = get_section_text(soup, nav_map.get("Conclusions"))

        # Extract extra info
        authors_list, num_authors = extract_authors(soup)
        pub_date = extract_pub_date(soup)

        # Build document
        article_doc = {
            "Title": title,
            "Link": link,
            "Abstract": abstract,
            "Results and Discussion": results,
            "Conclusions": conclusion,
            "Authors": authors_list,
            "NumAuthors": num_authors,
            "PublishedDate": pub_date,
            "Keywords": [],   # empty for now
            "AISummary": ""   # empty for now
        }

        # Insert into MongoDB
        collection.insert_one(article_doc)

        # Debug print to confirm scraping worked
        print("="*120)
        print(f"Inserted: {title}")
        for k, v in article_doc.items():
            if isinstance(v, str) and v:
                print(f"{k}: {v[:200]}{'...' if len(v) > 200 else ''}")
            else:
                print(f"{k}: {v}")

        time.sleep(2)  # avoid getting blocked

    except Exception as e:
        print(f"Failed to process {title}: {e}")
q
# import pandas as pd
# import requests
# from bs4 import BeautifulSoup
# from pymongo import MongoClient
# import time

# # Step 1: Load dataset
# csv_file = "SB_publication_PMC.csv"
# df = pd.read_csv(csv_file)

# # Step 2: Connect to MongoDB
# client = MongoClient("mongodb://localhost:27017/")  # adjust if remote
# db = client["ArticlesDB"]
# collection = db["Articles"]

# # Step 3: Headers to avoid 403 F    orbidden
# headers = {
#     "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
#                   "AppleWebKit/537.36 (KHTML, like Gecko) "
#                   "Chrome/118.0.0.0 Safari/537.36"
# }

# # Helper functions
# def extract_section_by_id(soup, section_id):
#     section = soup.find("section", id=section_id)
#     if section:
#         paragraphs = section.find_all("p")
#         return " ".join(p.get_text(strip=True) for p in paragraphs)
#     return None

# def extract_authors(soup):
#     authors = soup.select("div.authors span.contrib")
#     return [a.get_text(strip=True) for a in authors], len(authors)

# def extract_pub_date(soup):
#     meta_date = soup.find("meta", {"name": "citation_publication_date"})
#     if meta_date:
#         return meta_date.get("content")
#     date_span = soup.find("span", class_="epub-date")
#     return date_span.get_text(strip=True) if date_span else None

# # Step 4: Iterate through dataset
# for idx, row in df.iterrows():
#     title = row["Title"]
#     link = row["Link"]

#     try:
#         response = requests.get(link, headers=headers, timeout=10)
#         response.raise_for_status()
#         soup = BeautifulSoup(response.text, "html.parser")

#         # Extract sections
#         abstract = extract_section_by_id(soup, "abstract1")
#         results = extract_section_by_id(soup, "s3")
#         conclusion = extract_section_by_id(soup, "s5")

#         # Extract extra info
#         authors_list, num_authors = extract_authors(soup)
#         pub_date = extract_pub_date(soup)

#         # Build document
#         article_doc = {
#             "Title": title,
#             "Link": link,
#             "Abstract": abstract,
#             "Results and Discussion": results,
#             "Conclusions": conclusion,
#             "Authors": authors_list,
#             "NumAuthors": num_authors,
#             "PublishedDate": pub_date,
#             "Keywords": [],   # empty for now
#             "AISummary": ""   # empty for now
#         }

#         # Insert into MongoDB
#         #collection.insert_one(article_doc)
#         print(f"Inserted: {title}")
#         print(f"======================================================================================================\n{article_doc}")

#         time.sleep(2)  # avoid getting blocked

#     except Exception as e:
#         print(f"Failed to process {title}: {e}")

# # import pandas as pd
# # import requests
# # from bs4 import BeautifulSoup
# # from pymongo import MongoClient
# # import time

# # # Step 1: Load dataset
# # csv_file = "SB_publication_PMC.csv"
# # df = pd.read_csv(csv_file)

# # # Step 2: Connect to MongoDB
# # client = MongoClient("mongodb://localhost:27017/")  # adjust if remote
# # db = client["ArticlesDB"]
# # collection = db["Articles"]
# # headers = {
# #     "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
# #                   "AppleWebKit/537.36 (KHTML, like Gecko) "
# #                   "Chrome/118.0.0.0 Safari/537.36"
# # }



# # # Helper function to extract section text
# # def extract_section(soup, section_name):
# #     section_anchor = soup.find("a", string=section_name)
# #     if section_anchor:
# #         anchor_id = section_anchor.get("data-anchor-id")
# #         if anchor_id:
# #             section_div = soup.find(id=anchor_id)
# #             if section_div:
# #                 paragraphs = section_div.find_all("p")
# #                 return " ".join(p.get_text(strip=True) for p in paragraphs)
# #     return None

# # def extract_section_by_id(soup, section_id):
# #     section = soup.find("section", id=section_id)
# #     if section:
# #         paragraphs = section.find_all("p")
# #         return " ".join(p.get_text(strip=True) for p in paragraphs)
# #     return None

# # def extract_authors(soup):
# #     authors = soup.select("div.authors span.contrib")
# #     return [a.get_text(strip=True) for a in authors], len(authors)

# # def extract_pub_date(soup):
# #     meta_date = soup.find("meta", {"name": "citation_publication_date"})
# #     if meta_date:
# #         return meta_date.get("content")
# #     date_span = soup.find("span", class_="epub-date")
# #     return date_span.get_text(strip=True) if date_span else None

# # # Step 3: Iterate through dataset
# # for idx, row in df.iterrows():
# #     title = row["Title"]
# #     link = row["Link"]

   
# #     try:
# #         response = requests.get(link, headers=headers, timeout=10)
# #         response.raise_for_status()
# #         soup = BeautifulSoup(response.text, "html.parser")

# #         abstract = extract_section_by_id(soup, "abstract")
# #         results = extract_section_by_id(soup, "Sec2")
# #         conclusion = extract_section_by_id(soup, "Sec3")

# #         authors_list, num_authors = extract_authors(soup)
# #         pub_date = extract_pub_date(soup)

# #         article_doc = {
# #             "Title": title,
# #             "Link": link,
# #             "Abstract": abstract,
# #             "Results and Discussion": results,
# #             "Conclusions": conclusion,
# #             "Authors": authors_list,
# #             "NumAuthors": num_authors,
# #             "PublishedDate": pub_date,
# #             "Keywords": [],  # empty for now
# #             "AISummary": ""  # empty for now
# #         }

# #         # Extract sections...
# #         # abstract = extract_section(soup, "Abstract")
# #         # results = extract_section(soup, "Results and Discussion")
# #         # conclusion = extract_section(soup, "Conclusions")

# #         # # Insert into MongoDB
# #         # article_doc = {
# #         #     "Title": title,
# #         #     "Link": link,
# #         #     "Abstract": abstract,
# #         #     "Results and Discussion": results,
# #         #     "Conclusions": conclusion,
# #         #     "AISummary": "" #empty for future use
# #         # }
# #         # collection.insert_one(article_doc)
# #         print(f"Inserted: {title}")

# #         time.sleep(2)  # avoid getting blocked

# #     except Exception as e:
# #         print(f"Failed to process {title}: {e}")
