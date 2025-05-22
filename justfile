preview-docs:
    rm -rf docs/_extensions/molviewspec-live
    cp -r _extensions/molviewspec-live  docs/_extensions
    quarto preview docs


render-docs:
    rm -rf docs/_extensions/molviewspec-live
    cp -r _extensions/molviewspec-live  docs/_extensions
    quarto render docs
