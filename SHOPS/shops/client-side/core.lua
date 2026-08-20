-----------------------------------------------------------------------------------------------------------------------------------------
-- VRP
-----------------------------------------------------------------------------------------------------------------------------------------
local Tunnel = module("vrp","lib/Tunnel")
local Proxy = module("vrp","lib/Proxy")
vRP = Proxy.getInterface("vRP")
-----------------------------------------------------------------------------------------------------------------------------------------
-- CONNECTION
-----------------------------------------------------------------------------------------------------------------------------------------
vSERVER = Tunnel.getInterface("shops")
-----------------------------------------------------------------------------------------------------------------------------------------
-- VARIABLES
-----------------------------------------------------------------------------------------------------------------------------------------
local Opened = false
-----------------------------------------------------------------------------------------------------------------------------------------
-- OPENSHOP
-----------------------------------------------------------------------------------------------------------------------------------------
local function OpenShop(Mode)
	if not List[Mode] then
		return
	end

	Opened = Mode

	SetNuiFocus(true,true)
	SetCursorLocation(0.5,0.5)
	TransitionToBlurred(1000)
	TriggerEvent("hud:Active",false)

	local Catalog = List[Opened]
	local Items = {}

	local CurrentAmounts = vSERVER.Current(Opened) or {}

	for _,v in pairs(ItemList[Opened]) do
		Items[#Items + 1] = {
			Item = v.key,
			Name = exports.vrp:ItemName(v.key),
			Description = exports.vrp:ItemDescription(v.key),
			Type = exports.vrp:ItemType(v.key),
			Price = v.price,
			Weight = exports.vrp:ItemWeight(v.key),
			Image = exports.vrp:ItemIndex(v.key),
			Max = exports.vrp:ItemMaxAmount(v.key),
			Durability = exports.vrp:ItemDurability(v.key),
			Current = CurrentAmounts[v.key] or 0,
			Rarity = exports.vrp:ItemRarity(v.key)
		}
	end

	local CurrentWeight,MaxWeight,ItemWeight = vSERVER.Weight(Opened)

	SendNUIMessage({
		Action = "Open",
		Payload = {
			Key = Opened,
			Name = Catalog.Name,
			Description = Catalog.Description,
			Mode = Catalog.Mode,
			Type = Catalog.Type,
			ItemName = Catalog.Type == "Consume" and Catalog.Item and exports.vrp:ItemName(Catalog.Item) or nil,
			Weight = CurrentWeight or 0,
			MaxWeight = MaxWeight or 0,
			ItemWeight = ItemWeight or 0,
			Blackout = GlobalState.Blackout or false,
			Items = Items
		}
	})
end
-----------------------------------------------------------------------------------------------------------------------------------------
-- CLOSESHOP
-----------------------------------------------------------------------------------------------------------------------------------------
local function CloseShop()
	if not Opened then
		return
	end

	Opened = false
	SetNuiFocus(false,false)
	SetCursorLocation(0.5,0.5)
	TransitionFromBlurred(1000)
	TriggerEvent("hud:Active",true)
	SendNUIMessage({ Action = "Close" })
end
-----------------------------------------------------------------------------------------------------------------------------------------
-- SHOPS:CLOSE
-----------------------------------------------------------------------------------------------------------------------------------------
RegisterNetEvent("shops:Close")
AddEventHandler("shops:Close",CloseShop)
-----------------------------------------------------------------------------------------------------------------------------------------
-- INVENTORY:CLOSE
-----------------------------------------------------------------------------------------------------------------------------------------
RegisterNetEvent("inventory:Close")
AddEventHandler("inventory:Close",CloseShop)
-----------------------------------------------------------------------------------------------------------------------------------------
-- CLOSE
-----------------------------------------------------------------------------------------------------------------------------------------
RegisterNUICallback("Close",function(Data,Callback)
	CloseShop()

	Callback("Ok")
end)
-----------------------------------------------------------------------------------------------------------------------------------------
-- CHECKOUT
-----------------------------------------------------------------------------------------------------------------------------------------
RegisterNUICallback("Checkout",function(Data,Callback)
	local Shop = Opened

	CloseShop()

	local Success = false
	if MumbleIsConnected() and Shop then
		Success = vSERVER.Checkout(Shop,Data.Items,Data.Payment)
	end

	Callback({ Success = Success and true or false })
end)
-----------------------------------------------------------------------------------------------------------------------------------------
-- MOUNT
-----------------------------------------------------------------------------------------------------------------------------------------
RegisterNUICallback("Mount",function(Data,Callback)
	local Primary,PrimaryWeight,PrimarySlots = vSERVER.Mount(Opened)
	if Primary then
		Callback({
			Primary = {
				Data = Primary,
				MaxWeight = PrimaryWeight,
				Slots = PrimarySlots or Theme.inventory.slots.default
			},
			Secondary = {
				Data = ItemList[Opened],
				Slots = math.max(CountTable(ItemList[Opened]),25)
			}
		})
	end
end)
-----------------------------------------------------------------------------------------------------------------------------------------
-- TAKE
-----------------------------------------------------------------------------------------------------------------------------------------
RegisterNUICallback("Take",function(Data,Callback)
	if MumbleIsConnected() then
		vSERVER.Take(Data.Item,Data.Amount,Data.Target,Opened)
	end

	Callback("Ok")
end)
-----------------------------------------------------------------------------------------------------------------------------------------
-- STORE
-----------------------------------------------------------------------------------------------------------------------------------------
RegisterNUICallback("Store",function(Data,Callback)
	if MumbleIsConnected() then
		vSERVER.Store(Data.Item,Data.Amount,Data.Target,Opened)
	end

	Callback("Ok")
end)
-----------------------------------------------------------------------------------------------------------------------------------------
-- SHOPS:OPEN
-----------------------------------------------------------------------------------------------------------------------------------------
AddEventHandler("shops:Open",function(Number)
	if exports.hud:Wanted() then
		return
	end

	local Shop = Location[Number]
	if not Shop then
		if vSERVER.Permission(Number) and List[Number] then
			if List[Number].Mode == "Sell" then
				Opened = Number
				TriggerEvent("inventory:Open",{
					Type = "Shops",
					Mode = List[Number].Mode,
					Item = List[Number].Item or "dollar",
					Resource = "shops",
					Right = "Loja"
				})
			else
				OpenShop(Number)
			end
		end

		return
	end

	local RouteMatch = not Shop.Route or Shop.Route == LocalPlayer.state.Route
	if not RouteMatch or not vSERVER.Permission(Shop.Mode) then
		return
	end

	if List[Shop.Mode].Mode == "Sell" then
		Opened = Shop.Mode
		TriggerEvent("inventory:Open",{
			Type = "Shops",
			Mode = List[Shop.Mode].Mode,
			Item = List[Shop.Mode].Item or "dollar",
			Resource = "shops",
			Right = Shop.Name or "Loja"
		})
	else
		OpenShop(Shop.Mode)
	end

	if Shop.Sound then
		TriggerEvent("sounds:Private","shop",0.5)
	end
end)
-----------------------------------------------------------------------------------------------------------------------------------------
-- THREADSERVERSTART
-----------------------------------------------------------------------------------------------------------------------------------------
CreateThread(function()
	for Number,v in pairs(Location) do
		if v.Circle then
			exports.target:AddCircleZone("Shops:"..Number,v.Coords,v.Circle,{
				name = "Shops:"..Number,
				heading = 0.0,
				useZ = true
			},{
				shop = Number,
				Distance = 2.0,
				options = {
					{
						event = "shops:Open",
						label = "Abrir",
						tunnel = "client"
					}
				}
			})
		else
			exports.target:AddBoxZone("Shops:"..Number,v.Coords,0.75,0.75,{
				name = "Shops:"..Number,
				heading = 0.0,
				minZ = v.Coords.z - 1.0,
				maxZ = v.Coords.z + 1.0
			},{
				shop = Number,
				Distance = 2.0,
				options = {
					{
						event = "shops:Open",
						label = "Abrir",
						tunnel = "client"
					}
				}
			})
		end
	end
end)