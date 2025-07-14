print("Starting model extraction")

local fs = require("@lune/fs")
local roblox = require("@lune/roblox")

local gamePlace = roblox.deserializePlace(fs.readFile("./assets/GamePlace.rbxl"))

local function safeWriteModel(path, instance)
    if instance then
        fs.writeFile(path, roblox.serializeModel({instance}, true))
        print("Saved: " .. path)
    else
        print("Warning: Failed to save " .. path .. " (instance not found)")
    end
end


local function createModelsRecursively(instance)
    if not instance:IsA("Folder") then
        return
    end

    local targetDir = 'Models/' .. instance.Name
    if not fs.isDir(targetDir) then
        fs.writeDir(targetDir)
    end

    for _, child in ipairs(instance:GetChildren()) do
        if child:IsA("Model") then
            print("Saving model: " .. child.Name)
            local modelPath = targetDir .. "/" .. child.Name .. '.rbxmx'
            fs.writeFile(modelPath, roblox.serializeModel({child}, true))
            print("Saved model: " .. modelPath)
        elseif child:IsA("Folder") then
            createModelsRecursively(child)
        end
    end
end


local clientModelDir = 'Models'
print("Creating client models")
createModelsRecursively(gamePlace.Workspace:FindFirstChild(clientModelDir))

local placeFile = gamePlace.Workspace:FindFirstChild("Place")
if placeFile then
    print("Saving Place model")
    local placePath = 'GamePlaceTemp.rbxmx'
    safeWriteModel(placePath, placeFile)
else
    print("Warning: Place model not found")
end


print("Model extraction complete")