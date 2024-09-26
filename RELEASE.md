Release Workflow
----------------

1. Update Version in `pyproject.toml`
2. Update `ANOL_COMMIT_HASH` in `.github/workflows/publish.yml`
3. Create commit and merge
```bash
git commit -m "chore: version update 1.0.0" 
```
4. Create tag and push 
```bash
git tag 1.0.0
git push --tags
```
