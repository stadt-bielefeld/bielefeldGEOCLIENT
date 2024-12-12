Release Workflow
----------------

1. Update Version in `pyproject.toml`
1. Update `ANOL_COMMIT_HASH` in the Dockerfile if needed
1. Create commit and merge
    ```bash
    git commit -m "chore: version update 1.0.0"
    ```
1. Create tag and push 
    ```bash
    git tag 1.0.0
    git push --tags
    ```
