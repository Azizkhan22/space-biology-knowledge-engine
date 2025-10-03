import pandas as pd
import requests
from bs4 import BeautifulSoup
from pymongo import MongoClient
import time
import logging

# ================== SETUP ==================
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")

csv_file = "SB_publication_PMC.csv"
df = pd.read_csv(csv_file)

client = MongoClient("mongodb://localhost:27017/")
db = client["ArticlesDB"]
collection = db["Articles"]

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/118.0.0.0 Safari/537.36"
}

# ================== HELPERS ==================
def get_section_by_header(soup, keywords):
    """
    Locate section by searching for headers (h2, h3, h4) with given keywords.
    Returns concatenated paragraph text.
    """
    for header in soup.find_all(["h2", "h3", "h4"]):
        text = header.get_text(strip=True).lower()
        if any(kw in text for kw in keywords):
            content = []
            # Collect all following siblings until next header of same level
            for sib in header.find_all_next():
                if sib.name in ["h2", "h3", "h4"]:
                    break
                if sib.name == "p":
                    para = sib.get_text(strip=True)
                    if para:
                        content.append(para)
            if content:
                return " ".join(content)
    return None

def get_abstract(soup):
    # Try meta description first
    abstract_div = soup.find("div", class_="abstract") or soup.find("section", id=lambda x: x and "abstract" in x.lower())
    if abstract_div:
        paras = [p.get_text(strip=True) for p in abstract_div.find_all("p") if p.get_text(strip=True)]
        if paras:
            return " ".join(paras)

    # Fallback: header search
    return get_section_by_header(soup, ["abstract"])

def get_results(soup):
    return (
        get_section_by_header(soup, ["results", "discussion", "findings"]) 
        or get_section_by_header(soup, ["results"])
    )

def get_conclusions(soup):
    return get_section_by_header(soup, ["conclusion", "conclusions", "summary", "closing"])

def extract_authors(soup):
    return [m.get("content") for m in soup.find_all("meta", {"name": "citation_author"}) if m.get("content")]

def extract_pub_date(soup):
    meta_date = soup.find("meta", {"name": "citation_publication_date"})
    if meta_date:
        return meta_date.get("content")
    date_span = soup.find("span", class_="epub-date")
    return date_span.get_text(strip=True) if date_span else None

# ================== MAIN LOOP ==================
for idx, row in df.iterrows():
    title, link = row["Title"], row["Link"]
    try:
        logging.info(f"Fetching {title}")
        response = requests.get(link, headers=headers, timeout=15)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")

        # Extract sections
        abstract = get_abstract(soup) or "Not Found"
        results = get_results(soup) or "Not Found"
        conclusion = get_conclusions(soup) or "Not Found"

        # Authors + Date
        authors_list = extract_authors(soup)
        num_authors = len(authors_list)
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
            "Keywords": [],
            "AISummary": ""
        }

        collection.insert_one(article_doc)
        logging.info(f"Inserted: {title}")
        print(f"data :: {article_doc}")

        time.sleep(2)

    except Exception as e:
        logging.error(f"Failed to process {title}: {e}")
