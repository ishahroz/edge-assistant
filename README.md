# edge-assistant

## Objective:

Create a full-stack application with a React-based chat interface that interacts with a backend API for answering user questions using a combination of LLM (Large Language Models) and RAG (Retrieval-Augmented Generation). The focus is to enable the application to provide insights from a given dataset (Excel file) and leverage an LLM for answering other queries.

## Key Features to Implement:

1. Frontend (React):
   - Build a chat interface where users can type questions and receive answers.
   - Display the conversation history in an intuitive way.
   - Include basic styling to make the interface user-friendly.
2. Backend (Node.js):
   - Accept user questions via an API endpoint.
   - Determine whether the question is related to the provided dataset or requires general knowledge.
   - Use RAG to query the dataset for specific operations (e.g., median, max, or min salaries by department).
   - Use an LLM to handle general questions not related to the dataset.
3. Dataset (Excel):
   - Use the provided fake dataset of employee names, departments, and salaries.
   - Perform basic statistical calculations on the dataset:
     - Median, maximum, and minimum salaries by department.
4. Technology Choices:
   - Candidates are free to use any:
     - LLM provider: OpenAI, Hugging Face, Anthropic, etc.
     - Vector database: Pinecone, Weaviate, Milvus, or any other.
5. RAG Pipeline:
   - Use a vector database for indexing and querying.
   - Parse user queries to identify operations (e.g., group by department, calculate median salary).
   - Return relevant answers from the dataset.

## Dataset Details:

A fake dataset has been prepared with the following structure:
Name Department Salary
Employee_1 HR 65,000
Employee_2 IT 90,000
Employee_3 Finance 78,000
... ... ...

- Download the Excel file: Fake Employee Dataset

## Implementation Requirements:

1. Frontend Requirements:
   - Use React to create a responsive chat interface.
   - Make API calls to the backend for user queries.
   - Display questions and answers in a conversational format.
2. Backend Requirements:
   - Set up a Django server with a REST API endpoint for receiving queries.
   - Implement the following logic:
     - If the question pertains to the dataset, use the RAG pipeline to retrieve and calculate the answer.
     - For general questions, use an LLM to generate a response.
     - Always follow test driven development in Django.
3. Dataset Querying:
   - Parse queries like:
     - "What is the median salary in the IT department?"
     - "Which department has the highest-paid employee?"
   - Perform the requested calculations using the dataset.
4. LLM Integration:
   - Use the LLM to answer questions outside the scope of the dataset (e.g., "Explain what RAG is").
   - Ensure the backend supports the LLM provider of your choice.
5. Documentation:
   - Provide clear instructions on:
     - How to set up the project.
     - How to run the application.
     - How the system determines whether to query the dataset or the LLM.

## Evaluation Criteria:

1. Correctness:
   - The system correctly answers questions about the dataset.
   - The LLM integration works as expected for general questions.
2. User Experience:
   - The chat interface is intuitive and responsive.
3. Code Quality:
   - Code is well-structured and documented.
4. Scalability:
   - The solution should allow for easy replacement of the LLM or vector database.
5. Bonus:
   - Unit tests and a proper test coverage.

## Submission:

- Submit the source code for both the frontend and backend.
- Include a README file with setup instructions.
- Ensure the project is runnable locally or provide deployment instructions.
