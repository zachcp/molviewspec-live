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
