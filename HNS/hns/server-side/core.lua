-----------------------------------------------------------------------------------------------------------------------------------------
-- VRP
-----------------------------------------------------------------------------------------------------------------------------------------
local Tunnel = module("vrp","lib/Tunnel")
local Proxy = module("vrp","lib/Proxy")
vRP = Proxy.getInterface("vRP")
-----------------------------------------------------------------------------------------------------------------------------------------
-- CONNECTION
-----------------------------------------------------------------------------------------------------------------------------------------
Creative = {}
Tunnel.bindInterface("hns",Creative)
-----------------------------------------------------------------------------------------------------------------------------------------
-- PLAYER
-----------------------------------------------------------------------------------------------------------------------------------------
function Creative.Player()
	local source = source
	local Passport = vRP.Passport(source)
	if not Passport then
		return false
	end

	local Table = {
		Passport = Passport,
		Name = vRP.FullName(Passport) or "Jogador"
	}

	if Config.Avatar then
		local AvatarPermission = Config.AvatarPermission or Config.Group

		if AvatarPermission then
			local Success,Avatar = pcall(function()
				return exports.vrp:Avatar(Passport,AvatarPermission)
			end)

			Table.Avatar = Success and Avatar or nil
		else
			-- Sem permissão configurada: busca a foto direto na tabela avatars
			local Consult = exports.oxmysql:single_async("SELECT Image FROM avatars WHERE Passport = @Passport ORDER BY id DESC LIMIT 1",{ Passport = Passport })
			Table.Avatar = Consult and Consult.Image or nil
		end
	end

	return Table
end
-----------------------------------------------------------------------------------------------------------------------------------------
-- HNS:OPEN
-----------------------------------------------------------------------------------------------------------------------------------------
RegisterServerEvent("hns:Open")
AddEventHandler("hns:Open",function()
	local source = source
	local Passport = vRP.Passport(source)
	if not Passport then
		return false
	end

	if Config.Group and not vRP.HasGroup(Passport,Config.Group) then
		return false
	end

	TriggerClientEvent("hns:Opened",source)
end)
-----------------------------------------------------------------------------------------------------------------------------------------
-- HNS:CLOSE
-----------------------------------------------------------------------------------------------------------------------------------------
RegisterServerEvent("hns:Close")
AddEventHandler("hns:Close",function()
	TriggerClientEvent("hns:Close",source)
end)
