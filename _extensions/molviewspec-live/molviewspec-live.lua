local function loadHtmlDeps()
    quarto.doc.addHtmlDependency {
        name = 'molstar',
        version = 'v4.17.0',
        scripts = { './assets/molstar.js' },
        stylesheets = { './assets/molstar.css' },
    }
    quarto.doc.addHtmlDependency {
        name = 'molviewspec-live',
        version = 'v0.1.0',
        scripts = { './app/molviewspeclive.umd.js' },
        stylesheets = { './assets/app.css' },
    }
    quarto.doc.attach_to_dependency('molviewspec-live', './app/assets/python_stdlib.zip')
    quarto.doc.attach_to_dependency('molviewspec-live', './app/assets/python_stdlib.zip')
    quarto.doc.attach_to_dependency('molviewspec-live', './app/assets/pyodide-lock.json')
    quarto.doc.attach_to_dependency('molviewspec-live', './app/assets/pyodide.asm.js')
    quarto.doc.attach_to_dependency('molviewspec-live', './app/assets/pyodide.asm.wasm')
    quarto.doc.attach_to_dependency('molviewspec-live', './app/assets/pyodide.js')
    quarto.doc.attach_to_dependency('molviewspec-live', './app/assets/pyodide.js.map')
    quarto.doc.attach_to_dependency('molviewspec-live', './app/assets/pyodide.mjs')
    quarto.doc.attach_to_dependency('molviewspec-live', './app/assets/pyodide.mjs.map')
    quarto.doc.attach_to_dependency('molviewspec-live', './app/assets/python_stdlib.zip')
end

-- Generate a unique ID for the molecule viewer container
local counter = 0
local function generateUniqueId()
    counter = counter + 1
    return "livemol-" .. counter
end

-- Process code blocks with the livemol class
function CodeBlock(el)
    loadHtmlDeps()
    if el.classes and el.classes:includes("molviewspec-live") then
        -- Generate a unique ID for this molecule viewer
        local id = generateUniqueId()

        -- Check for explicit render attribute first
        local language = nil
        if el.attributes and el.attributes.render then
            -- Use the explicit render attribute if available
            language = el.attributes.render
            -- Fall back to class-based detection
        elseif el.classes:includes("python") then
            language = "python"
        elseif el.classes:includes("js") or el.classes:includes("javascript") then
            language = "js"
        end

        local content = el.text
        -- Escape content for HTML attribute
        local escaped_content = content:gsub('&', '&amp;'):gsub('<', '&lt;'):gsub('>', '&gt;'):gsub('"', '&quot;')

        -- Add some classes based on content type
        local classes = "molviewspec-live"

        local html = string.format(
            '<div id="%s" class="%s" data-content="%s" data-language="%s"></div>\n<script>document.addEventListener("DOMContentLoaded", function() { var el = document.getElementById("%s"); MolViewSpecLive.appInit(el, null, el.getAttribute("data-content"), "%s"); });</script>',
            id,
            classes,
            escaped_content,
            language,
            id,
            language
        )
        return pandoc.RawBlock("html", html)
    end

    return el
end
