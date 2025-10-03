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
        print("Warning: Navigation list not found. Trying alternative methods...")
        # Fallback: try to find sections directly by common patterns
        return find_sections_fallback(soup, target_labels)
    
    print(f"Found navigation with {len(nav.find_all('a'))} links")
    
    for a in nav.find_all("a", attrs={"data-anchor-id": True, "data-ga-label": True}):
        label = a.get("data-ga-label", "").strip()
        anchor_id = a.get("data-anchor-id")
        print(f"Nav item: {label} -> {anchor_id}")
        if label in target_labels:
            sections[label] = anchor_id
            print(f"  ✓ Matched target: {label}")
    
    return sections

def find_sections_fallback(soup, target_labels):
    """Fallback method to find sections when nav is not available."""
    sections = {}
    
    # Look for Abstract
    if "Abstract" in target_labels:
        # Try multiple approaches
        abstract_section = (
            soup.find("div", id="abstract") or 
            soup.find("section", id=lambda x: x and "abstract" in x.lower()) or
            soup.find("div", id="abstract1") or
            soup.find("section", id="abstract1")
        )
        if abstract_section and abstract_section.get("id"):
            sections["Abstract"] = abstract_section.get("id")
    
    # Look for Results and Discussion by checking section titles
    if "Results and Discussion" in target_labels:
        all_sections = soup.find_all("section", id=True)
        for section in all_sections:
            title = section.find(["h2", "h3"], class_="pmc_sec_title")
            if title:
                title_text = title.get_text(strip=True).lower()
                if ("result" in title_text and "discussion" in title_text) or \
                   (title_text.startswith("result")):
                    sections["Results and Discussion"] = section.get("id")
                    break
        
        # Fallback to common IDs if not found by title
        if "Results and Discussion" not in sections:
            for possible_id in ["s3", "sec3", "results", "results-and-discussion"]:
                result_section = soup.find("section", id=possible_id)
                if result_section:
                    # Verify it's actually results section
                    title = result_section.find(["h2", "h3"], class_="pmc_sec_title")
                    if title:
                        title_text = title.get_text(strip=True).lower()
                        if "material" not in title_text and "method" not in title_text:
                            sections["Results and Discussion"] = possible_id
                            break
    
    # Look for Conclusions by checking section titles
    if "Conclusions" in target_labels:
        all_sections = soup.find_all("section", id=True)
        for section in all_sections:
            title = section.find(["h2", "h3"], class_="pmc_sec_title")
            if title:
                title_text = title.get_text(strip=True).lower()
                if "conclusion" in title_text:
                    sections["Conclusions"] = section.get("id")
                    break
        
        # Fallback to common IDs if not found by title
        if "Conclusions" not in sections:
            for possible_id in ["s5", "s4", "sec5", "sec6", "conclusions", "conclusion"]:
                conclusion_section = soup.find("section", id=possible_id)
                if conclusion_section:
                    sections["Conclusions"] = possible_id
                    break
    
    print(f"Fallback found sections: {sections}")
    return sections

def get_section_text(soup, section_id):
    """
    Extract text for a section given its anchor id.
    Handles:
    - Abstract: <h2 data-anchor-id="abstract1"> + following <p>
    - Results/Conclusions: <section id="s3">, with nested <section id="s3a">, <section id="s3b">, etc.
    """
    if not section_id:
        print("No Section ID provided")
        return None

    print(f"Extracting section: {section_id}")

    # Case 1: Abstract (header + following paragraphs until next h2)
    if "abstract" in section_id.lower():
        # Try multiple ways to find abstract
        h2 = soup.find("h2", {"data-anchor-id": section_id})
        
        if not h2:
            # Try finding by id on div or section
            abstract_container = soup.find(["div", "section"], id=section_id)
            if abstract_container:
                paragraphs = abstract_container.find_all("p")
                texts = [p.get_text(strip=True) for p in paragraphs if p.get_text(strip=True)]
                if texts:
                    print(f"  ✓ Found {len(texts)} abstract paragraphs (method: container)")
                    return " ".join(texts)
            
            # Try finding abstract by class
            abstract_div = soup.find("div", class_="abstract")
            if abstract_div:
                paragraphs = abstract_div.find_all("p")
                texts = [p.get_text(strip=True) for p in paragraphs if p.get_text(strip=True)]
                if texts:
                    print(f"  ✓ Found {len(texts)} abstract paragraphs (method: class)")
                    return " ".join(texts)
        
        if h2:
            texts = []
            # Get all siblings after h2 until we hit another h2
            for sib in h2.find_all_next():
                if sib.name == "h2":  # stop at next section header
                    break
                if sib.name == "p":
                    text = sib.get_text(strip=True)
                    if text:
                        texts.append(text)
            if texts:
                print(f"  ✓ Found {len(texts)} abstract paragraphs (method: h2 siblings)")
                return " ".join(texts)
        
        print("  ✗ Abstract not found")
        return None

    # Case 2: Results/Conclusions (main section with nested subsections)
    # First, try to find the main section by exact ID
    main_section = soup.find("section", id=section_id)
    
    if main_section:
        texts = []
        
        # Extract text from the main section and all nested sections
        def extract_text_recursive(section_element):
            section_texts = []
            
            # Get the section title if present
            title = section_element.find(["h2", "h3", "h4"], class_="pmc_sec_title", recursive=False)
            if title:
                section_texts.append(title.get_text(strip=True))
            
            # Get all direct paragraphs in this section (not in nested sections)
            for p in section_element.find_all("p", recursive=False):
                text = p.get_text(strip=True)
                if text:
                    section_texts.append(text)
            
            # Recursively process nested sections
            nested_sections = section_element.find_all("section", recursive=False)
            for nested in nested_sections:
                section_texts.extend(extract_text_recursive(nested))
            
            return section_texts
        
        texts = extract_text_recursive(main_section)
        if texts:
            print(f"  ✓ Found {len(texts)} text blocks (method: main section)")
            return " ".join(texts)
    
    # Fallback: Try to find all sections that start with the section_id prefix
    # This handles cases like s3a, s3b, s3c when looking for s3
    sections = soup.find_all("section", id=lambda x: x and x.startswith(section_id))
    if sections:
        texts = []
        for sec in sections:
            # Get section title
            title = sec.find(["h2", "h3", "h4"], class_="pmc_sec_title")
            if title:
                texts.append(title.get_text(strip=True))
            
            # Get all paragraphs in this section
            paragraphs = sec.find_all("p")
            for p in paragraphs:
                text = p.get_text(strip=True)
                if text:
                    texts.append(text)
        
        if texts:
            print(f"  ✓ Found {len(texts)} text blocks from {len(sections)} sections (method: prefix match)")
            return " ".join(texts)

    print(f"  ✗ Section '{section_id}' not found")
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
        abstract = get_section_text(soup, nav_map.get("Abstract"))
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