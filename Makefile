.PHONY: build clean debug server
.DEFAULT_GOAL := build


build:
	cd assets/ && npm install
	cd assets/ && bower install
	cd assets/ && webpack --optimize-minimize
	cd site/ && hugo


debug:
	cd assets/ && npm install
	cd assets/ && bower install
	cd assets/ && webpack


clean:
	rm -rf assets/bower_components/
	rm -rf assets/node_modules/
	rm -rf site/themes/spogliani/static/


server: debug
	cd site/ && hugo server
