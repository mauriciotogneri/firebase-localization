function onLanguageSelected()
{
	controller(DIALOG_LANGUAGE).onLanguageSelected()
}

app.controller(CONTROLLER_LANGUAGES, function($scope, database, databaseApi, databaseLanguage, databaseSegment, ui)
{
	$scope.apiToken = ''

	$scope.languages = {}

	$scope.loading = true

	$scope.init = function()
	{
		databaseLanguage.rootLive(languages =>
		{
			databaseSegment.rootStatic(segments =>
			{
				$scope.languages = summary(languages, segments)

				$scope.loading = false
				$scope.$applyAsync()

				databaseApi.token(token =>
				{
					$scope.apiToken = token
				})
			})
		})
	}

	function summary(languages, segments)
	{
		var result = []

		segments.forEach(segment =>
		{
			for (const languageIndex in segment.translations)
			{
				if (languages[languageIndex])
				{
					const translation = segment.translations[languageIndex]
					
					if (translation.value)
					{
						languages[languageIndex].translated++
					}

					if (translation.validated)
					{
						languages[languageIndex].validated++
					}
				}
			}
		})

		for (const index in languages)
		{
			languages[index].calculateSummary(segments.length)
			result.push(languages[index])
		}

		result = result.sort(function(a, b)
		{
			return (a.fullName < b.fullName ? -1 : (a.fullName > b.fullName))
		})

		return result
	}

	$scope.languageProgressValue = function(value)
	{
		return {
			width: `${value}%`
		}
	}

	$scope.languageProgressColor = function(value)
	{
		if (value == 100)
		{
			return 'progress-bar-indicator-high'
		}
		else if (value >= 50)
		{
			return 'progress-bar-indicator-medium'
		}
		else
		{
			return 'progress-bar-indicator-low'
		}
	}

	$scope.exportAndroid = function(language)
	{
		exportFile(language.code, 'android', $scope.apiToken)
	}

	$scope.exportIOS = function(language)
	{
		exportFile(language.code, 'ios', $scope.apiToken)
	}

	$scope.exportXliff = function(language)
	{
		exportFile(language.code, 'xliff', $scope.apiToken)
	}

	$scope.exportJson = function(language)
	{
		exportFile(language.code, 'json', $scope.apiToken)
	}

	$scope.exportYaml = function(language)
	{
		exportFile(language.code, 'yaml', $scope.apiToken)
	}

	function exportFile(languageCode, format, token)
	{
		downloadFile(`https://${window.location.host}/api/export/${languageCode}/${format}?token=${token}`)
	}

	function downloadFile(path)
	{
		console.log(`DOWNLOADING: ${path}`)

		const a = document.createElement('A')
		a.href = path
		a.download = path.substr(path.lastIndexOf('/') + 1)
		document.body.appendChild(a)
		a.click()
		document.body.removeChild(a)
	}

	$scope.openProfileDialog = function()
	{
		controller(DIALOG_PROFILE).open()
	}

	$scope.updateProfile = function(password)
	{
		firebase.auth().currentUser.updatePassword(password).catch(function(error)
		{
			ui.showError(error.message)
		})
	}

	$scope.logout = function()
	{
		firebase.auth().signOut().then(function()
		{
			window.location.href = '/'
		},
		function(error)
		{
			ui.showError(error.message)
		})
	}

	$scope.openImportDialog = function()
	{
		controller(DIALOG_IMPORT).open($scope.languages, $scope.apiToken)
	}

	$scope.openAddLanguageDialog = function()
	{
		controller(DIALOG_LANGUAGE).openAdd()
	}

	$scope.addLanguage = function(value)
	{
		const entry = {
			code: value
		}

		databaseLanguage.add(entry)
	}

	$scope.openEditLanguageDialog = function(language)
	{
		controller(DIALOG_LANGUAGE).openEdit(language)
	}

	$scope.editLanguage = function(id, value)
	{
		const entry = {
			code: value
		}

		databaseLanguage.update(id, entry)
	}

	$scope.openDeleteLanguageDialog = function(language)
	{
		controller(DIALOG_DELETE_LANGUAGE).open(language)
	}

	$scope.deleteLanguage = function(id)
	{
		databaseLanguage.remove(id)
	}

	$scope.init()
})