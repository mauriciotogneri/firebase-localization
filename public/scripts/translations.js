function setupApp()
{
	setupDatabase()
}

function setupDatabase()
{
	const dbRefLocales = firebase.database().ref().child('locales')
	
	dbRefLocales.on('value', snapLocales => {
		constructTranslationsTableHeader(snapLocales)

		const dbRef = firebase.database().ref().child('translations')
		
		dbRef.on('value', snapTranslations => {
			constructTranslationsTableEntries(snapTranslations)
			displayContent()
		})
	})
}

function constructTranslationsTableHeader(snap)
{
	const locales = snap.val()
	
	var oldTableHead = document.getElementById('translations-table-header')
	var newTableHead = document.createElement('thead')
	newTableHead.id = 'translations-table-header'
	newTableHead.classList.add('thead-default')

	newTableHead.appendChild(createEntryHeader(locales))

	oldTableHead.parentNode.replaceChild(newTableHead, oldTableHead)
}

function createEntryHeader(locales)
{
	var tr = document.createElement('tr')

	var thKey = document.createElement('th')
	thKey.appendChild(document.createTextNode('Key'))
	tr.appendChild(thKey)

	for (var locale in locales)
	{
		var thLocaleName = document.createElement('th')
		thLocaleName.appendChild(document.createTextNode(LOCALES[locale] + ' (' + locale + ')'))
		tr.appendChild(thLocaleName)

		var thLocaleProffIcon = document.createElement('th')
		var icon = document.createElement('i')
		icon.classList.add('fa')
		icon.classList.add('fa-check')
		icon.classList.add('translation-checkbox-header')
		thLocaleProffIcon.appendChild(icon)
		tr.appendChild(thLocaleProffIcon)
	}

	return tr
}

function constructTranslationsTableEntries(snap)
{
	const entries = snap.val()

	var oldTableBody = document.getElementById('translations-table-entries')
	var newTableBody = document.createElement('tbody')
	newTableBody.id = 'translations-table-entries'

	for (var entry in entries)
	{
		newTableBody.appendChild(createEntryRow(entry, entries[entry]))
	}

	oldTableBody.parentNode.replaceChild(newTableBody, oldTableBody)
}

function createEntryRow(key, entry)
{
	var tr = document.createElement('tr')

	var tdKey = document.createElement('td')
	tdKey.scope = 'row'
	var keyInput = document.createElement('input')
	keyInput.type = 'text'
	keyInput.classList.add('form-control')
	keyInput.value = key
	tdKey.appendChild(keyInput)
	tr.appendChild(tdKey)

	for (var locale in entry.locales)
	{
		createEntryInputs(key, locale, entry.locales[locale], tr)
	}

	return tr
}

function createEntryInputs(key, locale, entry, tr)
{
	var tdValue = document.createElement('td')
	var input = document.createElement('input')
	input.id = key + '/locales/' + locale + '/value'
	input.type = 'text'
	input.classList.add('form-control')
	input.value = entry.value
	input.onblur = function()
	{
		onInputUpdated(input.id, input.value)
	}
	tdValue.appendChild(input)
	tr.appendChild(tdValue)

	var tdProofread = document.createElement('td')
	tdProofread.classList.add('align-middle')
	tdProofread.classList.add('translation-checkbox-container')

	var labelCheckbox = document.createElement('label')
	labelCheckbox.classList.add('custom-control')
	labelCheckbox.classList.add('custom-checkbox')
	labelCheckbox.classList.add('translation-checkbox')

	var inputCheckbox = document.createElement('input')
	inputCheckbox.id = key + '/locales/' + locale + '/proofread'
	inputCheckbox.type = 'checkbox'
	inputCheckbox.checked = entry.proofread
	inputCheckbox.classList.add('custom-control-input')
	inputCheckbox.onchange = function()
	{
		onInputUpdated(inputCheckbox.id, inputCheckbox.checked)
	}
	labelCheckbox.appendChild(inputCheckbox)

	var spanCheckbox = document.createElement('span')
	spanCheckbox.classList.add('custom-control-indicator')
	labelCheckbox.appendChild(spanCheckbox)

	tdProofread.appendChild(labelCheckbox)
	tr.appendChild(tdProofread)
}

function onInputUpdated(id, value)
{
	firebase.database().ref('/translations/' + id).set(value, function(error) {
		/*if (error) {
			console.log("Data could not be saved." + error)
		} else {
			console.log("Data saved successfully.")
		}*/
	})
}