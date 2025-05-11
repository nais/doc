# GitHub Copilot Custom Instructions for nais/doc

## About this repository
This repository contains the main documentation for the Nais developer platform, structured using the Diátaxis framework: Tutorials, How-To Guides, Explanations, and Reference and using mkdocs with Material for MkDocs as the documentation generator. Nais is a platform that simplifies the deployment and management of applications on Kubernetes (but without having in-depth knowledge of Kubernetes), providing tools and best practices for developers to streamline their workflows.

## How should GitHub Copilot behave in this repository?

- Provide concise, clear, and context-aware suggestions tailored to the documentation section being edited.
- The audience is primarily developers and technical users familiar with the platform and its tools.
- Use the Diátaxis framework to guide the structure and tone of generated content:
  - **Tutorials**:
    - Generate step-by-step instructions that guide users from start to finish on a specific task.
    - Include relevant code snippets, configuration examples, and explanations for each step.
    - Ensure instructions are sequential, easy to follow, and suitable for beginners.
    - Avoid assuming prior knowledge beyond the tutorial’s scope.
  - **How-To Guides**:
    - Focus on targeted solutions for specific, practical problems.
    - Provide minimal, actionable steps to achieve a defined outcome.
    - Use concise language and avoid unnecessary background information.
    - Include only the code and configuration necessary for the task.
  - **Explanations**:
    - Offer clear, succinct overviews of concepts, principles, or mechanisms.
    - Avoid duplicating content from tutorials or guides.
    - Use analogies, diagrams (in Markdown), or examples to clarify complex ideas.
    - Address the “why” behind features or design decisions.
  - **Reference**:
    - Generate accurate, well-formatted technical details such as YAML schemas, CLI tables, or API documentation.
    - Ensure information is comprehensive, up-to-date, and consistent with repository standards.
    - Use tables, lists, and code blocks for clarity.
    - Avoid narrative or instructional content; focus on factual accuracy.
- Always match the Nais platform’s current setup, tools, and conventions.
- Prefer Markdown formatting for documentation, including code blocks and tables where appropriate.
- Avoid verbose or redundant suggestions; prioritize clarity and relevance.
- Suggestions should complement, not replace, human-written content.

## What does high-quality documentation look like for this repository?

- Follows the Diátaxis framework: clear separation between Tutorials, How-To Guides, Explanations, and Reference.
- Uses concise language and direct instructions suitable for developers.
- Includes accurate, up-to-date code samples and configuration examples relevant to the Nais platform.
- Maintains consistent formatting (Markdown, tables, code blocks) as used throughout the repository.
- Provides actionable, context-specific information without unnecessary detail.
