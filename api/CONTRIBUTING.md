## 🛠️ Contributing to <REPLACE ME> 🛠️

1. Submit or comment your intent on an issue
1. Create a branch
1. Submit your PR against `main`
1. Address PR Review

### Issue

Project tracking is done via GitHub [issues](https://github.com/cultofthepump/blobstream-starknet/issues).
First look at open issues to see if your request is already submitted.
If it is comment on the issue requesting assignment, if not open an issue.

We use 3 issue labels for development:

- `feat` -> suggest new feature
- `bug` -> create a reproducible bug report
- `dev` -> non-functional repository changes

These labels are used as prefixes as follows for `issue`, `branch name`, `pr title`:

- `[feat]` -> `feat/{issue #}-{issue name}` -> `feat:`
- `[bug]` -> `bug/{issue #}-{issue name}` -> `bug:`
- `[dev]` -> `dev/{issue #}-{issue name}` -> `dev:`

#### TODO

If your PR includes a `TODO` comment please open an issue and comment the relevant
code with `TODO(#ISSUE_NUM):`.

### Submit PR

Ensure your code is well formatted, well tested and well documented. A core contributor
will review your work. Address changes, ensure ci passes. 
Make sure to check the following:

Code is well formatted:

```bash
go fmt -c
```

Tests pass:

```bash
go test
```
