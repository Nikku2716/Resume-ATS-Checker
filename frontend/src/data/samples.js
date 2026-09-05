/**
 * ResumeLint Sample Data
 * Curated sample resumes and job descriptions for 1-click testing.
 */

export const SAMPLE_DATA = [
  {
    id: "fullstack",
    title: "Senior Full-Stack Engineer",
    category: "Software Engineering",
    resumeText: `ALEX RIVERA
San Francisco, CA | (555) 019-2834 | alex.rivera@email.com | linkedin.com/in/alexrivera-dev | github.com/alexrivera

SUMMARY
Results-driven Senior Full-Stack Engineer with 7+ years of experience designing and scaling distributed web applications and cloud architectures. Proven track record in React, Node.js, TypeScript, PostgreSQL, and Kubernetes. Reduced system latency by 45% and improved deployment reliability to 99.99% across enterprise microservices.

WORK EXPERIENCE
Lead Software Engineer | Apex Cloud Solutions | 2021 – Present
- Architected and deployed a multi-tenant SaaS analytics platform using React, TypeScript, Node.js, and GraphQL, supporting 500,000+ daily active users.
- Spearheaded migration from monolithic architecture to containerized microservices using Docker and Kubernetes on AWS (EKS, RDS, S3, CloudFront).
- Optimized PostgreSQL database queries and implemented Redis caching layer, reducing p99 API response times by 45%.
- Automated CI/CD pipelines with GitHub Actions and Terraform, accelerating release velocity from bi-weekly to multiple deployments daily.
- Mentored a cross-functional team of 8 engineers, conducting code reviews and championing test-driven development (TDD) with Jest and Cypress.

Full-Stack Developer | Nexus Interactive | 2018 – 2021
- Developed responsive client-facing web applications using React, Next.js, Redux, and Tailwind CSS.
- Built scalable RESTful APIs in Python (FastAPI) and Node.js with comprehensive OpenAPI/Swagger documentation.
- Integrated Stripe payment processing and OAuth2 authentication pipelines, handling $10M+ in annual transaction volume.
- Reduced bundle size by 38% through code splitting, tree shaking, and asset optimization, boosting Google Lighthouse score to 98.

EDUCATION
Bachelor of Science in Computer Science
University of California, Berkeley | 2014 – 2018

SKILLS
- Languages: TypeScript, JavaScript (ES6+), Python, Go, SQL, HTML5, CSS3
- Frontend: React, Next.js, Redux Toolkit, Tailwind CSS, Webpack, Vite
- Backend & Cloud: Node.js, Express, FastAPI, GraphQL, REST APIs, PostgreSQL, Redis, MongoDB
- DevOps & Tools: Docker, Kubernetes, AWS, Terraform, GitHub Actions, CI/CD, Git, Linux
- Methodologies: Agile/Scrum, Microservices Architecture, TDD, System Design, CI/CD`,

    jobDescription: `Senior Full-Stack Software Engineer

About the Role:
We are seeking an experienced Senior Full-Stack Software Engineer to lead the design and development of our next-generation cloud platform. You will collaborate with product designers, data engineers, and DevOps specialists to build robust, secure, and highly scalable web applications.

Responsibilities:
- Design, build, and maintain efficient, reusable, and reliable front-end and back-end code using React, TypeScript, and Node.js.
- Architect scalable RESTful APIs and GraphQL endpoints backed by PostgreSQL and Redis.
- Lead cloud infrastructure deployment and orchestration using Docker, Kubernetes, and AWS services.
- Establish automated CI/CD pipelines and infrastructure-as-code using Terraform and GitHub Actions.
- Collaborate with product management and engineering leadership on technical roadmap, system design, and architecture reviews.
- Mentor junior and mid-level engineers, promoting best practices in code quality, test-driven development, and security.

Requirements:
- 5+ years of professional software development experience in full-stack web applications.
- Strong proficiency in TypeScript, React, Node.js, and modern JavaScript ecosystems.
- Deep hands-on experience with relational databases (PostgreSQL), query optimization, and caching (Redis).
- Experience with containerization (Docker), orchestration (Kubernetes), and cloud platforms (AWS or GCP).
- Familiarity with CI/CD automation, Git workflows, and Infrastructure as Code (Terraform).
- Excellent communication skills, proactive problem-solving attitude, and collaborative team mindset.`,
  },
  {
    id: "devops",
    title: "Cloud & DevOps Architect",
    category: "Cloud Infrastructure",
    resumeText: `JORDAN CHEN
Seattle, WA | (555) 392-8172 | jordan.chen@email.com | github.com/jordanchen-ops

SUMMARY
Principal Cloud & DevOps Architect with 8+ years architecting enterprise Kubernetes infrastructure, zero-trust cloud security, and automated CI/CD pipelines on AWS and GCP. Reduced infrastructure operational costs by 32% while achieving 99.999% uptime.

EXPERIENCE
Staff DevOps Engineer | CloudScale Systems | 2020 – Present
- Designed and maintained multi-region Kubernetes clusters (EKS) hosting 200+ microservices with Istio service mesh.
- Implemented declarative Infrastructure as Code using Terraform, Helm, and ArgoCD (GitOps workflow).
- Built automated observability stacks with Prometheus, Grafana, OpenTelemetry, and Datadog.
- Decreased mean time to recovery (MTTR) from 45 minutes to under 5 minutes through automated health checks and self-healing pods.

Cloud Engineer | Horizon Tech | 2017 – 2020
- Built zero-downtime blue/green deployment pipelines utilizing GitLab CI and Docker.
- Administered Linux servers, VPC networking, IAM policies, and SSL/TLS certificate management.
- Spearheaded cloud cost optimization initiatives, reducing AWS spend by $120,000 annually.

EDUCATION
B.S. in Software Engineering | University of Washington | 2013 – 2017

SKILLS
- Cloud: AWS, GCP, Azure, VPC, IAM, RDS, S3, CloudFront
- Orchestration: Kubernetes, Docker, Helm, Istio, Terraform, ArgoCD
- CI/CD & Automation: GitHub Actions, GitLab CI, Jenkins, Bash, Python, Go
- Observability: Prometheus, Grafana, Datadog, ELK Stack, OpenTelemetry`,

    jobDescription: `Senior Cloud & DevOps Engineer

We are looking for a Senior DevOps Engineer to scale our global cloud infrastructure and drive GitOps adoption across our organization.

Key Responsibilities:
- Manage and scale multi-tenant Kubernetes clusters on AWS (EKS) with Terraform and Helm.
- Maintain and improve continuous integration and continuous deployment (CI/CD) pipelines with GitHub Actions and ArgoCD.
- Implement robust monitoring, alerting, and logging using Prometheus, Grafana, and Datadog.
- Drive cloud security compliance, IAM hardening, and network segregation across AWS environments.
- Automate repetitive operational tasks using Python, Go, or Bash.

Qualifications:
- 4+ years of production experience managing Kubernetes and AWS infrastructure.
- Expertise in Terraform and Infrastructure as Code methodologies.
- Proficiency in CI/CD pipeline automation and GitOps practices.
- Strong knowledge of Linux internals, networking protocols, and cloud security best practices.`,
  },
];
