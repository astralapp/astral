<?php
class AdminController extends BaseAdminController {
  public function index() {
    return View::make('admin/index')->with('users', User::all());
  }
  public function getBetaUsers() {
    return View::make('admin/betausers');
  }
  public function postEmail() {
    $subject = Input::get('subject');
    $betaUsers = BetaUser::where('unsubscribed', 0)->whereIn('email', Input::get('emails'))->get();
    foreach($betaUsers as $user){
      $msg = [ 'msg' => Markdown::parse( Input::get('message') ), 'user' => $user];
      Mail::queue('emails.admin', $msg, function($message) use ($user, $subject) {
          $message->to($user->email, $user->name)->subject($subject);
      });
    }
    return Redirect::to('admin/beta_users')->with('message', 'Email sent to '.count($betaUsers).' beta users.');
  }

  public function postBetaUsers() {
    $betaUser = BetaUser::create(
      [
        'full_name' => Input::get('full_name'),
        'email' => Input::get('email'),
        'github_username' => Input::get('github_username')
      ]
    );
    return Redirect::to('admin/beta_users')->with('message', Input::get('full_name').' added to beta users.');
  }

  public function getLogs() {
    $files = File::allFiles(storage_path().'/logs');
    sort($files);
    $logs = array();
    foreach ($files as $file) {
      $logEntry = array();
      $message = File::get($file);
      preg_match_all("/\[(.*?)\]/", $message, $matches);
      $message_date = explode(" ", $matches[1][0])[0];
      $logEntry['date'] = $message_date;
      array_push($logs, $logEntry);
    }
    return View::make('admin/logs/index')->with('logs', array_reverse($logs));
  }

  public function getLog($date) {
    $log = array();
    $log_levels = array(
      'EMERGENCY' => 'danger',
      'ALERT' => 'warning',
      'CRITICAL' => 'danger',
      'ERROR' => 'danger',
      'WARNING' => 'warning',
      'NOTICE' => 'primary',
      'INFO' => 'info',
      'DEBUG' => 'default'
    );
    $file = File::get(storage_path().'/logs/laravel-'.$date.'.log');
    $pattern = "/\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\].*/";
    preg_match_all($pattern, $file, $headings);
    $log_data = preg_split($pattern, $file);
    if ($log_data[0] < 1) {
      $trash = array_shift($log_data);
      unset($trash);
    }
    foreach ($headings as $h) {
      for ($i=0, $j = count($h); $i < $j; $i++) {
        foreach ($log_levels as $key => $value) {
          if ( strpos( strtolower($h[$i]), strtolower('.'.$key) ) ) {
            $log[] = array('level' => $key, 'class' => $value, 'header' => $h[$i], 'stack' => $log_data[$i]);
          }
        }
      }
    }
    return View::make('admin/logs/get_log')->with('log', array_reverse($log));

  }
}