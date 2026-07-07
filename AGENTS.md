# 🤖 AGENTS.md — AI Engineering Guidelines & Skill Index

Welcome! This document defines the architectural standards, behavioral protocols, and skill integration workflows for any automated coding agent or AI assistant contributing to this repository. 

Whenever you are tasked with creating, refactoring, securing, or documenting code in this project, **you must leverage the project-scoped skills installed in `.agents/skills/`**.

---

## 🏗️ 1. Core Behavioral Guidelines

* **Prioritize Local Skills:** Before generating standard boilerplate or generic Spring Boot code, check `.agents/skills/` for specialized patterns, templates, and best practices.
* **Modern Spring Boot Practices:** Always favor constructor injection (via Lombok `@RequiredArgsConstructor` where applicable), immutability (`final` fields, Java Records for DTOs), and layered architecture (Controller $\rightarrow$ Service $\rightarrow$ Repository).
* **Zero Hallucination of Dependencies:** Check `pom.xml` or `build.gradle` before importing libraries. If a skill recommends an Starter module (e.g., Spring Security, Actuator, Spring AI), ensure it is properly declared in the build configuration before writing implementation code.
* **Security & Observability by Default:** Never expose endpoints without considering authentication/authorization rules or proper logging/monitoring metrics.

---

## 🧰 2. Installed Skill Registry (`.agents/skills`)

You have access to **8 specialized skills** installed locally via symlink/universal scope. When triggered by a specific task, read the corresponding skill documentation inside the directory (e.g., `SKILL.md`, `README.md`, or pattern rules) before executing the request.

| Skill Directory | Source Package | Primary Role & When to Activate |
| :--- | :--- | :--- |
| **`spring-boot-engineer`** | `jeffallan/claude-skills` | **Core Scaffolding & Architecture:** Use for general application bootstrapping, structure setup, and broad architectural design decisions. |
| **`java-springboot`** | `github/awesome-copilot` | **Daily Coding & Idioms:** Use for generating standard REST controllers, JPA repositories, service layers, and entity definitions. |
| **`springboot-patterns`** | `affaan-m/everything-claude-code` | **Design Patterns & Refactoring:** Use when applying enterprise design patterns (Strategy, Factory, CQRS, DTO mapping) or structuring clean code. |
| **`spring-boot-security-jwt`** | `giuseppe-trisciuoglio/developer-kit` | **Authentication & Authorization:** Use whenever implementing login flows, JWT generation/validation, `SecurityFilterChain`, or role-based access control (RBAC). |
| **`spring-boot-openapi-documentation`**| `giuseppe-trisciuoglio/developer-kit` | **API Contracts & Swagger:** Use when generating or updating Swagger/OpenAPI annotations, schemas, example responses, and API documentation. |
| **`spring-boot-actuator`** | `giuseppe-trisciuoglio/developer-kit` | **Observability & Health Checks:** Use when configuring `/actuator` endpoints, custom health indicators, Prometheus metrics, or system monitoring. |
| **`spring-ai`** | `claude-dev-suite/claude-dev-suite` | **AI & LLM Integration:** Use when integrating LLM clients, prompt templating, output parsers, or embedding models via Spring AI. |
| **`spring-ai-mcp-server-patterns`** | `giuseppe-trisciuoglio/developer-kit` | **Model Context Protocol (MCP):** Use when exposing Spring Boot services as MCP servers, creating tool abstractions, or structured agent workflows. |

---

## ⚙️ 3. Task-to-Skill Workflow Routing

When executing a prompt, map your reasoning to the appropriate skill domain:

### A. Feature Development & CRUD Operations
1. **Activate:** `java-springboot` + `springboot-patterns`
2. **Execution Rules:**
   * Keep controllers lightweight; delegate all business logic to the service layer.
   * Use DTOs for client-facing API requests/responses—**never** expose database entities directly over REST.
   * Implement robust exception handling using a global `@ControllerAdvice`.

### B. Security Implementation (AuthN / AuthZ)
1. **Activate:** `spring-boot-security-jwt`
2. **Execution Rules:**
   * Configure stateless session management (`SessionCreationPolicy.STATELESS`) for JWT-based APIs.
   * Ensure passwords and sensitive tokens are hashed using `BCryptPasswordEncoder`.
   * Keep secret keys and expiration timers parameterized in `application.yml` / environment variables.

### C. LLM, AI & MCP Integration
1. **Activate:** `spring-ai` + `spring-ai-mcp-server-patterns`
2. **Execution Rules:**
   * Utilize Spring AI's `ChatClient` or `ChatModel` abstractions instead of hardcoding raw HTTP client calls to OpenAI, Gemini, or Anthropic.
   * When building MCP tools, ensure all tool inputs/outputs are strictly typed using Java Records or JSON Schema annotations so LLMs can reliably parse function definitions.

### D. Production Readiness (Docs & Monitoring)
1. **Activate:** `spring-boot-openapi-documentation` + `spring-boot-actuator`
2. **Execution Rules:**
   * Annotate controller classes with `@Tag` and endpoints with `@Operation`, providing clear summaries and response codes (`@ApiResponse`).
   * Secure sensitive Actuator endpoints (e.g., `/env`, `/beans`, `/heapdump`), exposing only `/health` and `/info` to the public web if necessary.

---

## 📋 4. How Agents Should Load Skills

When evaluating a user prompt, adhere to the following execution sequence: