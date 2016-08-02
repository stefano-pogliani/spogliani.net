.PHONY: build clean debug publish server upload
.DEFAULT_GOAL := build


build:
	cd assets/ && npm install
	cd assets/ && bower install
	cd assets/ && webpack --optimize-minimize
	cd site/ && hugo


clean:
	rm -rf assets/bower_components/
	rm -rf assets/node_modules/
	rm -rf site/themes/spogliani/static/


debug:
	cd assets/ && npm install
	cd assets/ && bower install
	cd assets/ && webpack


publish: clean build upload


server: debug
	cd site/ && hugo server


upload:
	aws --profile=spogliani-net s3 sync --delete out/ s3://spogliani.net/
	aws --profile=spogliani-net s3 sync --delete out/ s3://www.spogliani.net/
