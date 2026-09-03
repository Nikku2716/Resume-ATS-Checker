import json
import os
import sys
from pathlib import Path

# Add backend to path
backend_dir = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_dir))

from app.analyzers.scorer import AtsScorer

scorer = AtsScorer()

FIXTURES = [
    {
        "id": "high_keyword_match",
        "name": "High Keyword Match",
        "description": "Resume contains nearly all keywords and skills requested in the job description",
        "resume": """Professional Summary
Senior Software Engineer with 6+ years of experience in Python, TypeScript, React, Docker, and AWS.
Proven track record of designing REST APIs and leading microservice architecture.

Technical Skills
Languages: Python, TypeScript, SQL, HTML, CSS
Frameworks: React, FastAPI, Node.js
Cloud & DevOps: AWS, Docker, Kubernetes, CI/CD, Git, Terraform
Databases: PostgreSQL, Redis, MongoDB

Work Experience
Senior Software Engineer | CloudTech Inc | 2021 - Present
- Designed scalable RESTful microservices with FastAPI and PostgreSQL
- Deployed containerized applications to Kubernetes on AWS ECS
- Led a team of 5 engineers delivering high-quality web applications using Agile

Education
B.S. in Computer Science | Tech University | 2015 - 2019
""",
        "job_description": """Senior Software Engineer
We are seeking a Senior Software Engineer with Python and TypeScript expertise.
Requirements:
- 5+ years of experience with Python, FastAPI, and React
- Experience with Docker, Kubernetes, AWS, and CI/CD pipelines
- Strong background in PostgreSQL, Redis, and microservices
- Experience in Agile environments and Git version control
""",
    },
    {
        "id": "low_keyword_match",
        "name": "Low Keyword Match",
        "description": "Resume contains minimal keywords from the job description",
        "resume": """Professional Summary
Experienced accountant with 10 years managing corporate tax filings, audits, and financial ledgers.

Core Competencies
Financial reporting, tax preparation, QuickBooks, Excel, auditing, payroll

Work Experience
Lead Accountant | Finance Corp | 2018 - Present
- Prepared quarterly financial statements and tax filings
- Conducted internal audits and ensured regulatory compliance
- Managed payroll and expense reporting for 200+ employees

Education
B.S. in Accounting | State College | 2010 - 2014
""",
        "job_description": """Senior Cloud Infrastructure Engineer
Requirements:
- Strong experience with Kubernetes, Terraform, AWS, Docker, and Python
- Experience building CI/CD pipelines with GitHub Actions and GitLab
- Deep understanding of distributed systems, Kafka, Redis, and PostgreSQL
- Linux systems administration and network security
""",
    },
    {
        "id": "missing_keywords",
        "name": "Missing Keywords",
        "description": "Resume matches general skills but misses specific tech stack keywords",
        "resume": """Professional Summary
Full stack developer with 4 years of experience building web applications.

Skills
JavaScript, PHP, Laravel, MySQL, Apache, Linux, CSS, HTML

Experience
Software Developer | WebWorks | 2020 - Present
- Built custom web applications using PHP and MySQL
- Maintained web servers and handled database queries
- Implemented user interfaces with JavaScript and CSS

Education
B.S. in Information Systems | City University | 2016 - 2020
""",
        "job_description": """Full Stack Engineer
Looking for a developer experienced in:
- Python, Django, FastAPI
- React, TypeScript, Tailwind CSS
- PostgreSQL, Redis
- Docker, AWS, GraphQL
""",
    },
    {
        "id": "strong_skills_match",
        "name": "Strong Skills Match",
        "description": "Resume contains all the technical and soft skills requested",
        "resume": """Professional Summary
Staff Engineer with extensive background in machine learning and data engineering.

Skills
Python, PyTorch, TensorFlow, Scikit-Learn, Pandas, NumPy, SQL, Docker, AWS, Git, Leadership, Communication, Problem-Solving, Mentoring

Experience
Lead ML Engineer | AI Labs | 2019 - Present
- Led machine learning projects from concept to deployment
- Mentored junior engineers and communicated technical roadmaps
- Designed deep learning models with PyTorch and TensorFlow

Education
M.S. in Computer Science | Tech University | 2017 - 2019
""",
        "job_description": """Senior Machine Learning Engineer
Requirements:
- Proficient in Python, PyTorch, TensorFlow, scikit-learn, Pandas, NumPy, SQL
- Experience with Docker and AWS
- Strong leadership, communication, problem-solving, and mentoring abilities
""",
    },
    {
        "id": "weak_skills_match",
        "name": "Weak Skills Match",
        "description": "Resume contains none of the requested technical skills",
        "resume": """Professional Summary
Creative Graphic Designer with 5 years of experience in branding and print design.

Skills
Photoshop, Illustrator, InDesign, Typography, Branding, Print Design

Experience
Graphic Designer | Creative Studio | 2019 - Present
- Designed marketing materials and brand identities
- Collaborated with copywriters and marketing teams

Education
B.A. in Graphic Design | Art Institute | 2015 - 2019
""",
        "job_description": """Embedded Systems Software Engineer
Requirements:
- C++, Rust, Linux, Bash, Git, microservices
- Real-time operating systems (RTOS), kernel debugging
- Docker, Kubernetes, CI/CD
""",
    },
    {
        "id": "strong_experience_relevance",
        "name": "Strong Experience Relevance",
        "description": "Resume experience years match or exceed job description requirements with high keyword alignment",
        "resume": """Summary
Principal Architect with 8+ years of experience in distributed systems.

Skills
Python, Go, Kubernetes, AWS, Docker, Microservices, PostgreSQL, Kafka

Experience
Principal Architect | Enterprise Scale | 2016 - Present
- Architected distributed microservices handling 100K requests per second
- Managed Kubernetes clusters across multiple AWS regions
- Led engineering initiatives and automated CI/CD deployment pipelines

Education
B.S. in Computer Engineering | State University | 2012 - 2016
""",
        "job_description": """Senior Backend Architect
We need a Senior Backend Architect with 5+ years of experience.
Must have deep knowledge of Python, Go, Kubernetes, AWS, microservices, Kafka, and PostgreSQL.
""",
    },
    {
        "id": "weak_experience_relevance",
        "name": "Weak Experience Relevance",
        "description": "Resume has minimal experience compared to a senior requirement",
        "resume": """Summary
Recent computer science graduate with internship experience.

Skills
Python, Java, Git, HTML, CSS

Experience
Software Intern | Tech Startup | 2024 - 2024
- Assisted in bug fixes and documentation

Education
B.S. in Computer Science | City College | 2020 - 2024
""",
        "job_description": """Staff Software Architect
Requires 10+ years of experience in cloud infrastructure, Kubernetes, distributed systems, and enterprise architecture.
Proficiency in Python, Go, AWS, Docker, Microservices, and Kafka.
""",
    },
    {
        "id": "missing_sections",
        "name": "Missing Sections",
        "description": "Resume is missing standard sections (no Summary, no Education)",
        "resume": """John Doe - Software Engineer
Skills: Python, React, SQL, Docker, AWS

Experience:
Senior Developer | Acme Corp | 2020 - Present
- Developed web services in Python and React
- Deployed applications on AWS with Docker
""",
        "job_description": """Software Engineer with Python, React, SQL, Docker, AWS.
Looking for candidates with strong development background.
""",
    },
    {
        "id": "malformed_resume",
        "name": "Malformed Resume",
        "description": "Resume with unusual formatting, tables, icons, and text box artifacts",
        "resume": """| Name | John Doe |
| Role | Developer |
| Contact | john@example.com |

⚡ Skills ⚡
⚡ Python ⚡ React ⚡ AWS ⚡ Docker ⚡ PostgreSQL ⚡ Git ⚡

   Summary info
   Short line 1
   Short line 2
   Short line 3

Experience:
Senior Engineer at Tech Inc (2020 - 2024)
Built REST APIs with Python and Docker
""",
        "job_description": """Software Engineer
Requirements: Python, React, AWS, Docker, PostgreSQL, Git
Experience building REST APIs
""",
    },
    {
        "id": "empty_resume",
        "name": "Empty Resume",
        "description": "Empty resume text analyzed against a standard job description",
        "resume": "",
        "job_description": "Looking for a Python software engineer with AWS and Docker experience.",
    },
    {
        "id": "empty_job_description",
        "name": "Empty Job Description",
        "description": "Standard resume analyzed against an empty job description",
        "resume": """Professional Summary
Software Engineer with 4 years experience in Python and AWS.

Skills
Python, AWS, Docker, PostgreSQL

Experience
Software Engineer | Tech Corp | 2020 - Present
- Built cloud applications

Education
B.S. in Computer Science | University | 2016 - 2020
""",
        "job_description": "",
    },
    {
        "id": "long_resume",
        "name": "Long Resume",
        "description": "Detailed multi-page style resume with extensive job history and bullet points",
        "resume": """Professional Summary
Distinguished Engineering Leader with 12+ years of experience architecting high-scale distributed systems, leading cross-functional teams, and driving engineering excellence across global organizations.

Technical Skills
Languages: Python, Go, Rust, Java, TypeScript, JavaScript, SQL, C++, Bash
Cloud & Platforms: AWS, Azure, GCP, Kubernetes, Docker, Terraform, Ansible, Linux
Databases & Storage: PostgreSQL, MySQL, Redis, MongoDB, Elasticsearch, Cassandra, Kafka, DynamoDB
Architecture: Microservices, Event-Driven, Serverless, REST, GraphQL, gRPC, Distributed Systems
DevOps & CI/CD: GitHub Actions, GitLab CI, Jenkins, ArgoCD, Prometheus, Grafana, Datadog
Practices: Agile, Scrum, Kanban, TDD, Code Reviews, System Design, Mentoring, Technical Strategy

Professional Experience

Vice President of Engineering | GlobalTech Systems | 2022 - Present
- Led an organization of 65+ engineers across 6 distributed teams building enterprise cloud platform
- Architected hybrid cloud solution reducing infrastructure spend by $2.4M annually
- Spearheaded company-wide migration to event-driven microservices architecture on AWS and Kubernetes
- Implemented robust observability stack with OpenTelemetry, Prometheus, and Grafana

Principal Software Architect | CloudScale Networks | 2019 - 2022
- Designed real-time data ingestion pipeline handling 500M+ events daily using Kafka, Go, and Redis
- Optimized PostgreSQL database clusters achieving 70% query latency reduction
- Mentored 15+ senior engineers and established engineering standards and architectural review board
- Automated deployment workflows using Terraform and GitHub Actions across 40+ microservices

Senior Software Engineer | DataStream Inc | 2015 - 2019
- Built RESTful and GraphQL APIs using Python, FastAPI, and Django serving 2M active users
- Implemented automated testing strategy with PyTest and Cypress, achieving 92% test coverage
- Deployed containerized applications with Docker onto AWS ECS and EKS clusters
- Collaborated with product managers to deliver 24 major features on schedule

Software Engineer | WebPioneer Solutions | 2012 - 2015
- Developed full-stack web applications using JavaScript, React, Node.js, and MySQL
- Migrated legacy monolithic PHP applications to modern microservice architecture
- Implemented OAuth and JWT authentication workflows for enterprise clients

Education
M.S. in Computer Science | Stanford University | 2010 - 2012
B.S. in Software Engineering | University of California, Berkeley | 2006 - 2010

Certifications
AWS Certified Solutions Architect - Professional
Certified Kubernetes Administrator (CKA)
Google Cloud Professional Cloud Architect

Publications
"Architecting Resilient Distributed Systems at Scale" - IEEE Software Conference 2021
"Event-Driven Patterns for Modern SaaS Platforms" - Cloud Native Journal 2019
""",
        "job_description": """VP of Engineering / Principal Architect
We are seeking an executive-level engineering leader with 10+ years of experience to lead our Platform Engineering group.

Key Responsibilities:
- Lead and scale engineering organizations (50+ engineers)
- Define architectural strategy for distributed cloud platforms
- Drive cloud infrastructure across AWS, Kubernetes, and Terraform
- Champion engineering culture, mentoring, and technical excellence

Required Qualifications:
- 10+ years of professional software engineering experience
- 5+ years of technical leadership / people management experience
- Deep expertise in Python, Go, distributed systems, microservices, and event-driven architecture
- Mastery of AWS, Docker, Kubernetes, Terraform, PostgreSQL, Redis, and Kafka
- Track record of scaling systems to millions of users
- Strong communication, strategic planning, and stakeholder management skills
""",
    },
    {
        "id": "duplicate_keywords",
        "name": "Duplicate Keywords",
        "description": "Resume with repeated mentions of keywords across multiple sections",
        "resume": """Professional Summary
Python Python Python developer with AWS AWS AWS experience.

Skills
Python, Python, AWS, AWS, Docker, Docker, React, React

Experience
Python Engineer | Python Corp | 2021 - Present
- Used Python and AWS to build Python services
- Deployed Python with Docker on AWS
- Python testing with PyTest on AWS

Education
B.S. in Python Science | Tech University | 2017 - 2021
""",
        "job_description": """Python Developer
Requirements: Python, AWS, Docker, React, PostgreSQL
""",
    },
    {
        "id": "capitalization_differences",
        "name": "Capitalization Differences",
        "description": "Resume with various capitalization schemes for keywords (UPPERCASE, lowercase, TitleCase, mixed)",
        "resume": """PROFESSIONAL SUMMARY
SENIOR SOFTWARE ENGINEER with expertise in PYTHON, REACT, and DOCKER.

SKILLS
python, TYPESCRIPT, React, aws, POSTGRESQL, FastApi, KuBerNeTes

EXPERIENCE
Software Engineer | TECH CORP | 2021 - Present
- Built apps with Python and FastApi
- Managed POSTGRESQL databases

EDUCATION
B.S. Computer Science | State University | 2017 - 2021
""",
        "job_description": """Senior Developer
Looking for candidates skilled in:
- Python, TypeScript, React
- AWS, PostgreSQL, FastAPI, Kubernetes
""",
    },
    {
        "id": "punctuation_differences",
        "name": "Punctuation Differences",
        "description": "Resume with hyphenated, slashed, and dotted keyword variants (CI/CD, Node.js, micro-services)",
        "resume": """Professional Summary
Full-stack engineer specializing in CI/CD, Node.js, and micro-services.

Skills
Node.js, CI/CD, Micro-services, REST-APIs, Front-End, Back-End, C++, C#, .NET

Experience
Developer | Tech Co | 2021 - Present
- Built micro-services with Node.js and REST-APIs
- Automated CI/CD pipelines

Education
B.S. in CS | Tech College | 2017 - 2021
""",
        "job_description": """Software Engineer
Requirements:
- CI/CD pipelines
- Nodejs and REST APIs
- Microservices architecture
- Frontend and backend development
""",
    },
    {
        "id": "unicode_text",
        "name": "Unicode Text",
        "description": "Resume containing Unicode characters (smart quotes, em dashes, accents, non-ASCII bullet points)",
        "resume": """Professional Summary — Résumé
Senior Software Engineer • 5+ years building “cloud-native” applications.

Skills
Python • TypeScript • React • Docker • AWS • PostgreSQL

Experience
Lead Developer — Zürich Tech • 2020 – Present
• Designed APIs with FastAPI & PostgreSQL
• Reduced latency by 45% — deployed on AWS

Education
B.Sc. in Informatique • Université de Genève • 2016 – 2020
""",
        "job_description": """Senior Software Engineer
Requirements:
- Python, TypeScript, React, Docker, AWS, PostgreSQL
- FastAPI and cloud architecture
""",
    },
    {
        "id": "common_resume_headings",
        "name": "Common Resume Headings",
        "description": "Resume using various standard heading aliases (Profile, Work History, Academic Background, Core Competencies)",
        "resume": """Profile
Experienced developer building web solutions.

Core Competencies
Python, React, Docker, PostgreSQL, Git

Work History
Developer | Acme | 2021 - Present
- Built software applications

Academic Background
B.S. in Computing | University | 2017 - 2021

Certificates & Licenses
AWS Certified Developer
""",
        "job_description": """Software Developer
Looking for Python, React, Docker, PostgreSQL, Git.
""",
    },
    {
        "id": "boundary_scores",
        "name": "Boundary Scores",
        "description": "Minimal content testing edge-case boundary scores",
        "resume": """Summary
Junior developer.
""",
        "job_description": """Principal Cloud Architect with 15+ years of experience.
Expert in Rust, C++, Kubernetes, Terraform, AWS, Azure, GCP, distributed systems, high-frequency trading.
""",
    },
]


def generate():
    fixtures_dir = Path(__file__).parent / "tests" / "fixtures"
    fixtures_dir.mkdir(parents=True, exist_ok=True)

    summary_records = []

    for f in FIXTURES:
        res = scorer.analyze(f["resume"], f["job_description"])
        result_dict = res.model_dump()

        fixture_data = {
            "id": f["id"],
            "name": f["name"],
            "description": f["description"],
            "input": {
                "resume": f["resume"],
                "job_description": f["job_description"],
            },
            "expected_output": result_dict,
        }

        # Save individual fixture file
        fixture_file = fixtures_dir / f"{f['id']}.json"
        with open(fixture_file, "w", encoding="utf-8") as out:
            json.dump(fixture_data, out, indent=2, ensure_ascii=False)

        summary_records.append(fixture_data)
        print(f"Generated fixture: {f['id']} (overall_score: {result_dict['overall_score']})")

    # Save master fixtures file
    master_file = fixtures_dir / "baseline_fixtures.json"
    with open(master_file, "w", encoding="utf-8") as out:
        json.dump(summary_records, out, indent=2, ensure_ascii=False)

    print(f"\nAll {len(FIXTURES)} fixtures generated successfully in {fixtures_dir}")


if __name__ == "__main__":
    generate()
