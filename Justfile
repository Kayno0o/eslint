build:
	bun run build

lint-actions:
	actionlint -config-file actionlint.yaml .forgejo/workflows/*.yml

patch: # v0.0.X
	npm version patch
	git push --follow-tags

minor: # v0.X.0
	npm version minor
	git push --follow-tags

major: # vX.0.0
	npm version major
	git push --follow-tags
