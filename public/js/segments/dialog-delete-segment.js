app.controller(DIALOG_DELETE_SEGMENT, function($scope, ui)
{
	$scope.form = {
		id: '',
		key: ''
	}

	$scope.open = function(segment)
	{
		$scope.form.id  = segment.id
		$scope.form.key = segment.key

		ui.openDialog(DIALOG_DELETE_SEGMENT)
	}

	$scope.onDeleteSegment = function(form)
	{
		controller(CONTROLLER_SEGMENTS).deleteSegment(form.id)

		ui.closeDialog(DIALOG_DELETE_SEGMENT)
	}
})