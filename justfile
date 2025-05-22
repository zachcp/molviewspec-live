download-deps:
    wget -P _extensions/molviewspec-live/assets https://unpkg.com/molstar@4.17.0/build/viewer/molstar.js
    wget -P _extensions/molviewspec-live/assets https://unpkg.com/molstar@4.17.0/build/viewer/molstar.css

preview-docs:
    rm -rf docs/_extensions/molviewspec-live
    cp -r _extensions/molviewspec-live  docs/_extensions
    quarto preview docs

render-docs:
    rm -rf docs/_extensions/molviewspec-live
    cp -r _extensions/molviewspec-live  docs/_extensions
    quarto render docs

app-preview:
    cd app && npm i && npm run dev

app-build:
    rm -rf _extensions/molviewspec-live/app
    cd app && npm i && npm run build
    cp -r app/dist _extensions/molviewspec-live/app

build-all: app-build  render-docs


preview-all: app-build  preview-docs
