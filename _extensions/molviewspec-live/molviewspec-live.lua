-- Process code blocks with the livemol class
function CodeBlock(el)
    function apply_template(template, template_vars)
        local file = io.open(quarto.utils.resolve_path("templates/" .. template), "r")
        assert(file)
        local content = file:read("*a")
        for k, v in pairs(template_vars) do
            content = string.gsub(content, "{{" .. k .. "}}", v)
        end
        return content
    end

    if el.classes and el.classes:includes("molviewspec-live") then
        -- Generate a unique ID for this molecule viewer
        -- local id = generateUniqueId()

        -- Get the content and escape it for embedding in HTML
        local content = el.text

        -- Add some classes based on content type
        local classes = "molviewspec-live"

        local updatedmarkdown = apply_template("two_column.qmd", { content = content })
        print("Post sub markdown: " .. updatedmarkdown)

        local parsed = pandoc.read(updatedmarkdown, "markdown")
        -- Return a RawBlock with QMD content
        -- return pandoc.RawBlock("markdown", updatedmarkdown)
        -- return pandoc.RawBlock("html", updatedmarkdown)
        return parsed.blocks
    end

    return el
end
