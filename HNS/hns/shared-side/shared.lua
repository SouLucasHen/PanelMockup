-----------------------------------------------------------------------------------------------------------------------------------------
-- CONFIG
-----------------------------------------------------------------------------------------------------------------------------------------
Config = {
	-- Cor principal do painel (hex). A UI deriva hover, luz e fundo escuro
	-- automaticamente a partir desta cor (ver utils/setTheme.js).
	Theme = "#66ad43",

	-- Grupo/permissão necessário para abrir o painel.
	-- nil = qualquer jogador logado pode abrir.
	Group = nil,

	-- Comando para abrir/fechar o painel.
	Command = "panel",
	CommandDescription = "Abrir/Fechar o painel.",

	-- Tecla de atalho padrão (nil = sem atalho registrado).
	Key = "F7",

	-- Buscar a foto do avatar do jogador (mesmo padrão da mdt:
	-- exports.vrp:Avatar(Passport, AvatarPermission)).
	Avatar = true,
	AvatarPermission = nil
}
