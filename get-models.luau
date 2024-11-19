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

safeWriteModel('./GamePlace.rbxmx', gamePlace.Workspace:FindFirstChild("Place"))

print("Model extraction complete")