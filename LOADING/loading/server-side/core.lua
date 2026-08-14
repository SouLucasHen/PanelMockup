-----------------------------------------------------------------------------------------------------------------------------------------
-- PLAYERCONNECTING
-----------------------------------------------------------------------------------------------------------------------------------------
AddEventHandler("playerConnecting",function(_,_,deferrals)
	deferrals.defer()

	deferrals.handover({
		video = Video,
		socials = Socials,
		playlist = Playlist,
		theme = Theme,
		autoplay = Autoplay,
		shortcuts = Shortcuts,
		keybindings = Keybindings,
		progress = Progress,
		classification = Classification,
		classificationAge = ClassificationAge,
		classificationTitle = ClassificationTitle,
		classificationText = ClassificationText
	})

	deferrals.done()
end)