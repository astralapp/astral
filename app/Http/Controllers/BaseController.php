<?php

class BaseController extends Controller {

	public function __construct()
	{
		$this->beforeFilter('ngCSRF', ['on' => ['post', 'put', 'patch', 'delete']]);
	}

	/**
	 * Setup the layout used by the controller.
	 *
	 * @return void
	 */
	protected function setupLayout()
	{
		if ( ! is_null($this->layout))
		{
			$this->layout = View::make($this->layout);
		}
	}

}
