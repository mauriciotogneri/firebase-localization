function onLanguageSelected()
{
	angular.element($("body")).scope().onLanguageSelected();
}

angular.module('overviewApp', []).controller('overviewCtrl', function($scope)
{
	$scope.locales = {}

	$scope.dialog = {
		locale: {
			id: '',
			originalCode: '',
			buttonDisabled: true
		},
		deleteLocale: {
			id: '',
			name: ''
		}
	}

	$scope.init = function()
	{
		localesRef().on('value', snapLocales =>
		{	
			$scope.locales = localesFromSnap(snapLocales)

			translationsRef().on('value', snapTranslations =>
			{
				const summary = $scope.summary($scope.locales, translationsFromSnap(snapTranslations))

				for (const index in summary)
				{
					const entry = summary[index]
					$scope.locales[index].translated = (entry.total > 0) ? parseInt(entry.translated * 100 / entry.total) : 0
					$scope.locales[index].validated  = (entry.total > 0) ? parseInt(entry.validated  * 100 / entry.total) : 0
				}

				$scope.$applyAsync()
				displayContent()
			})
		})
	}

	$scope.summary = function(locales, translations)
	{
		var summary = {}

		for (const index in locales)
		{
			summary[index] = {
				translated: 0,
				validated: 0,
				total: 0
			}
		}

		for (const translationIndex in translations)
		{
			const translation = translations[translationIndex]

			for (const localeIndex in translation.locales)
			{
				const locale = translation.locales[localeIndex]
				
				summary[localeIndex].total++

				if (locale.value)
				{
					summary[localeIndex].translated++
				}

				if (locale.validated)
				{
					summary[localeIndex].validated++
				}
			}
		}

		return summary
	}

	$scope.localeProgressValue = function(value)
	{
		return {
			width: value + '%'
		}
	}

	$scope.localeProgressColor = function(value)
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

	$scope.exportAndroid = function(locale)
	{
		downloadFile('https://' + window.location.host + '/api/export/' + locale.code + '/android')
	}

	$scope.exportIOS = function(locale)
	{
		downloadFile('https://' + window.location.host + '/api/export/' + locale.code + '/ios')
	}

	$scope.openAddLanguageDialog = function()
	{
		openLanguageDialog(null, '')
	}

	$scope.openEditLanguageDialog = function(locale)
	{
		openLanguageDialog(locale.id, locale.code)
	}

	$scope.onLanguageSelected = function()
	{
		const value = byId('language-dialog-select').value
		
		$scope.dialog.locale.buttonDisabled = (value == $scope.dialog.locale.originalCode)
		$scope.$applyAsync()
	}

	function openLanguageDialog(id, select)
	{
		$scope.dialog.locale.id = id
		$scope.dialog.locale.originalCode = select
		$scope.dialog.locale.buttonDisabled = true

		$('#language-dialog-select').val(select).trigger('change.select2')
		$('#language-dialog').modal()
	}

	$scope.onAddLanguage = function(form)
	{
		var value = {
			code: byId('language-dialog-select').value
		}

		addLocaleRef(value)
	}

	$scope.onEditLanguage = function(form)
	{
		var value = {
			code: byId('language-dialog-select').value
		}

		updateLocaleRef(form.id, value)
	}

	$scope.openDeleteLanguageDialog = function(locale)
	{
		$scope.dialog.deleteLocale.id = locale.id
		$scope.dialog.deleteLocale.name = locale.fullName

		$('#delete-language-dialog').modal()
	}

	$scope.onDeleteLanguage = function()
	{
		removeLocaleRef($scope.dialog.deleteLocale.id)
	}

	$scope.init()
})