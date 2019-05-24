bootstrap: clean
	yarn --ignore-engines;\
	./node_modules/.bin/lerna bootstrap;\
	./node_modules/.bin/lerna run build;\
	./node_modules/.bin/lerna bootstrap;\

clean:
	rm -rf node_modules;\
	rm -rf package-lock.json;\
	rm -rf packages/*/npm-debug*;\
	rm -rf packages/*/lib;\
	rm -rf packages/*/node_modules;\
	rm -rf packages/*/package-lock.json;

clean-lib:
	rm -rf packages/*/lib
