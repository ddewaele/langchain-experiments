# Setting up

- Setup your langsmith integration (https://smith.langchain.com/)
- Setup your Tavily integration


```
LANGCHAIN_TRACING_V2=true
LANGCHAIN_ENDPOINT=https://api.smith.langchain.com
LANGCHAIN_API_KEY=lsv2_....
LANGCHAIN_PROJECT=...
OPENAI_API_KEY=sk-...
```

If you want to test the dynamoDB integration you will need the following env vars. 

```
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_SESSION_TOKEN=
AWS_DEFAULT_REGION=
```

Once you start executing functions you will see the traces in langsmith