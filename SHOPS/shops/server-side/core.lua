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
Tunnel.bindInterface("shops",Creative)
-----------------------------------------------------------------------------------------------------------------------------------------
-- PERMISSION
-----------------------------------------------------------------------------------------------------------------------------------------
function Creative.Permission(Name)
	local source = source
	local Data = List[Name]
	local Passport = vRP.Passport(source)
	if not Passport or not Data then
		return false
	end

	if Name ~= "Banned" and (exports.bank:CheckTaxes(Passport) or exports.bank:CheckFines(Passport)) then
		return false
	end

	if not Data.Permission then
		return true
	end

	return vRP.HasService(Passport,Data.Permission) and true or false
end
-----------------------------------------------------------------------------------------------------------------------------------------
-- CHECKOUT
-----------------------------------------------------------------------------------------------------------------------------------------
function Creative.Checkout(Name,Items,Payment)
	local source = source
	local Passport = vRP.Passport(source)
	if not Passport or not Name or not List[Name] or not List[Name].List then
		return false
	end

	if List[Name].Route and List[Name].Route ~= GetPlayerRoutingBucket(source) then
		TriggerClientEvent("inventory:Update",source)
		return false
	end

	if not Items or type(Items) ~= "table" or #Items < 1 or #Items > 100 then
		return false
	end

	local Shop = List[Name]
	local Total = 0
	local Payload = {}

	for _,Entry in pairs(Items) do
		local Price = Shop.List[Entry.Item]
		if not Price then
			return false
		end

		local Amount = parseInt(Entry.Amount,true)
		if Amount < 1 then
			return false
		end

		if Amount > 1 and (exports.vrp:ItemUnique(Entry.Item) or exports.vrp:ItemLoads(Entry.Item)) then
			Amount = 1
		end

		if vRP.MaxItens(Passport,Entry.Item,Amount) then
			TriggerClientEvent("Notify",source,"Atenção","Limite de <b>"..exports.vrp:ItemName(Entry.Item).."</b> atingido.","vermelho",5000)
			return false
		end

		if not vRP.CheckWeight(Passport,Entry.Item,Amount) then
			TriggerClientEvent("Notify",source,"Aviso","Você não pode carregar este item.","amarelo",5000)
			return false
		end

		Total = Total + (Price * Amount)
		Payload[#Payload + 1] = { Item = Entry.Item, Amount = Amount }
	end

	if Shop.Type == "Cash" then
		if Payment == "Bank" then
			if not vRP.PaymentBank(Passport,Total,true) then
				TriggerClientEvent("Notify",source,"Aviso","Saldo bancário insuficiente.","amarelo",5000)
				return false
			end
		else
			if not vRP.TakeItem(Passport,"dollar",Total,true) then
				TriggerClientEvent("Notify",source,"Aviso","Dinheiro insuficiente.","amarelo",5000)
				return false
			end
		end
	elseif Shop.Type == "Consume" and Shop.Item then
		if not vRP.TakeItem(Passport,Shop.Item,Total,true) then
			TriggerClientEvent("Notify",source,"Atenção","<b>"..exports.vrp:ItemName(Shop.Item).."</b> insuficiente.","vermelho",5000)
			return false
		end
	elseif Shop.Type == "Gemstone" then
		if not vRP.PaymentGems(Passport,Total) then
			TriggerClientEvent("Notify",source,"Atenção","<b>Diamantes</b> insuficiente.","vermelho",5000)
			return false
		end
	end

	for _,Entry in pairs(Payload) do
		vRP.GenerateItem(Passport,Entry.Item,Entry.Amount,false)
	end

	TriggerClientEvent("inventory:Update",source)
	TriggerClientEvent("Notify",source,"Sucesso","Compra realizada.","verde",5000)

	return true
end
-----------------------------------------------------------------------------------------------------------------------------------------
-- CURRENT
-----------------------------------------------------------------------------------------------------------------------------------------
function Creative.Current(Name)
	local source = source
	local Passport = vRP.Passport(source)
	if not Passport or not Name or not List[Name] or not List[Name].List then
		return {}
	end

	local Current = {}
	for Item in pairs(List[Name].List) do
		Current[Item] = vRP.ItemAmount(Passport,Item)
	end

	return Current
end
-----------------------------------------------------------------------------------------------------------------------------------------
-- WEIGHT
-----------------------------------------------------------------------------------------------------------------------------------------
function Creative.Weight(Name)
	local source = source
	local Passport = vRP.Passport(source)
	if not Passport then
		return 0,0,0
	end

	local ItemWeight = 0
	if Name and List[Name] and List[Name].Type == "Consume" and List[Name].Item then
		ItemWeight = exports.vrp:ItemWeight(List[Name].Item)
	end

	return vRP.InventoryWeight(Passport),vRP.GetWeight(Passport),ItemWeight
end
-----------------------------------------------------------------------------------------------------------------------------------------
-- MOUNT
-----------------------------------------------------------------------------------------------------------------------------------------
function Creative.Mount(Name)
	local source = source
	local Passport = vRP.Passport(source)
	if Passport and Name and List[Name] then
		local Primary = {}
		local Inv = vRP.Inventory(Passport)
		for Slot,v in pairs(Inv) do
			if v.amount <= 0 or not exports.vrp:ItemExist(v.item) then
				vRP.CleanSlot(Passport,Slot)
			else
				v.key = v.item

				local Split = splitString(v.item)
				local Item = Split[1]

				if not v.desc then
					if Item == "vehiclekey" and Split[3] then
						local Consult = exports.oxmysql:single_async("SELECT * FROM vehicles WHERE Plate = ? LIMIT 1",{ Split[3] })
						if Consult and exports.vrp:VehicleExist(Consult.Vehicle) then
							v.desc = "Proprietário: <common>"..vRP.FullName(Consult.Passport).."</common><br>Modelo: <common>"..exports.vrp:VehicleName(Consult.Vehicle).."</common><br>Placa: <common>"..Split[3].."</common>"
						else
							v.desc = "Placa: <common>"..Split[3].."</common>"
						end
					elseif Item == "propertys" and Split[2] then
						local Consult = exports.oxmysql:single_async("SELECT * FROM propertys WHERE Serial = ? LIMIT 1",{ Split[2] })
						if Consult then
							v.desc = "Proprietário: <common>"..vRP.FullName(Consult.Passport).."</common>"
						end
					elseif exports.vrp:ItemNamed(Item) and Split[2] and vRP.Identity(Split[2]) then
						if Item == "identity" then
							v.desc = "Passaporte: <rare>"..Dotted(Split[2]).."</rare><br>Nome: <rare>"..vRP.FullName(Split[2]).."</rare><br>Telefone: <rare>"..vRP.Phone(Split[2]).."</rare>"
						else
							v.desc = "Proprietário: <common>"..vRP.FullName(Split[2]).."</common>"
						end
					end
				end

				if Split[2] then
					local Loaded = exports.vrp:ItemLoads(v.item)
					if Loaded then
						v.charges = parseInt(Split[2] * (100 / Loaded))
					end

					if exports.vrp:ItemDurability(v.item) then
						v.durability = parseInt(os.time() - Split[2])
						v.days = exports.vrp:ItemDurability(v.item)
					end
				end

				Primary[Slot] = v
			end
		end

		return Primary,vRP.GetWeight(Passport),vRP.InventorySlots(Passport)
	end
end
---------------------------------------------------------------------------------------------------------------------------------
-- TAKE
-----------------------------------------------------------------------------------------------------------------------------------------
function Creative.Take(Item,Amount,Target,Name)
	local source = source
	local Target = tostring(Target)
	local Amount = parseInt(Amount,true)
	local Passport = vRP.Passport(source)
	if Passport and Item and Target and List[Name] and List[Name]["Type"] and List[Name]["List"] and List[Name]["List"][Item] then
		if Amount > 1 and (exports.vrp:ItemUnique(Item) or exports.vrp:ItemLoads(Item)) then
			Amount = 1
		end

		if List[Name].Route and List[Name].Route ~= GetPlayerRoutingBucket(source) then
			TriggerClientEvent("inventory:Update",source)
			return false
		end

		local Inventory = vRP.Inventory(Passport)
		if not vRP.MaxItens(Passport,Item,Amount) and vRP.CheckWeight(Passport,Item,Amount) and (not Inventory[Target] or (Inventory[Target] and Inventory[Target]["item"] == Item)) then
			if List[Name]["Type"] == "Cash" then
				if vRP.PaymentFull(Passport,List[Name]["List"][Item] * Amount) then
					vRP.GenerateItem(Passport,Item,Amount,false,Target)
				else
					TriggerClientEvent("inventory:Notify",source,"Aviso","Dinheiro insuficiente.","amarelo")
				end
			elseif List[Name]["Type"] == "Consume" and List[Name]["Item"] then
				if vRP.TakeItem(Passport,List[Name]["Item"],List[Name]["List"][Item] * Amount) then
					vRP.GenerateItem(Passport,Item,Amount,false,Target)
				else
					TriggerClientEvent("inventory:Notify",source,"Atenção","<b>"..exports.vrp:ItemName(List[Name]["Item"]).."</b> insuficiente.","vermelho")
				end
			elseif List[Name]["Type"] == "Gemstone" then
				if vRP.PaymentGems(Passport,List[Name]["List"][Item] * Amount) then
					vRP.GenerateItem(Passport,Item,Amount,false,Target)
				else
					TriggerClientEvent("inventory:Notify",source,"Atenção","<b>Diamantes</b> insuficiente.","vermelho")
				end
			end
		end
	end

	TriggerClientEvent("inventory:Update",source)
end
---------------------------------------------------------------------------------------------------------------------------------
-- STORE
-----------------------------------------------------------------------------------------------------------------------------------------
function Creative.Store(Item,Amount,Slot,Name)
	local source = source
	local Split = SplitOne(Item)
	local Amount = parseInt(Amount,true)
	local Passport = vRP.Passport(source)
	if Passport and List[Name] and List[Name]["List"] and List[Name]["Type"] and List[Name]["List"][Split] and not vRP.CheckDamaged(Item) then
		if List[Name]["Type"] == "Cash" then
			if vRP.TakeItem(Passport,Item,Amount,false,Slot) then
				vRP.GenerateItem(Passport,"dollar",List[Name]["List"][Split] * Amount,false)
			end
		elseif List[Name]["Type"] == "Consume" then
			if vRP.TakeItem(Passport,Item,Amount,false,Slot) then
				vRP.GenerateItem(Passport,List[Name]["Item"],List[Name]["List"][Split] * Amount,false)
			end
		end
	end

	TriggerClientEvent("inventory:Update",source)
end
-----------------------------------------------------------------------------------------------------------------------------------------
-- SELL
-----------------------------------------------------------------------------------------------------------------------------------------
function Creative.Sell(Name,Items)
	local source = source
	local Passport = vRP.Passport(source)
	if not Passport or not Name or not List[Name] or List[Name]["Mode"] ~= "Sell" then
		return false
	end

	if not Items or type(Items) ~= "table" or #Items < 1 or #Items > 100 then
		return false
	end

	local Shop = List[Name]
	local Total = 0
	local Payload = {}

	for _,Entry in pairs(Items) do
		local Price = Shop.List[Entry.Item]
		if not Price then
			return false
		end

		local Amount = parseInt(Entry.Amount,true)
		if Amount < 1 then
			return false
		end

		if Amount > 1 and (exports.vrp:ItemUnique(Entry.Item) or exports.vrp:ItemLoads(Entry.Item)) then
			Amount = 1
		end

		if not vRP.ConsultItem(Passport,Entry.Item,Amount) then
			TriggerClientEvent("Notify",source,"Aviso","Você não possui a quantidade necessária.","amarelo",5000)
			return false
		end

		if vRP.CheckDamaged(Entry.Item) then
			TriggerClientEvent("Notify",source,"Aviso","Itens danificados não podem ser vendidos.","amarelo",5000)
			return false
		end

		Total = Total + (Price * Amount)
		Payload[#Payload + 1] = { Item = Entry.Item, Amount = Amount }
	end

	for _,Entry in pairs(Payload) do
		vRP.TakeItem(Passport,Entry.Item,Entry.Amount,false)
	end

	if Shop.Type == "Cash" then
		vRP.GenerateItem(Passport,"dollar",Total,true)
	elseif Shop.Type == "Consume" and Shop.Item then
		vRP.GenerateItem(Passport,Shop.Item,Total,true)
	end

	TriggerClientEvent("inventory:Update",source)
	TriggerClientEvent("Notify",source,"Sucesso","Venda realizada.","verde",5000)

	return true
end