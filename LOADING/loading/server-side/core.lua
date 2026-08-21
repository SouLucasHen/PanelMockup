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
		autoplayInterval = AutoplayInterval,
		shortcuts = Shortcuts,
		keybindings = Keybindings,
		progress = Progress,
		classification = Classification,
		classificationAge = ClassificationAge,
		classificationTitle = ClassificationTitle,
		classificationText = ClassificationText,
		tips = Tips,
		tipsSlides = TipsSlides
	})

	deferrals.done()
end)