<?php
class BetaUserTableSeeder extends Seeder {

  public function run()
  {
    DB::table('beta_users')->delete();

    BetaUser::create(
      [
        'full_name' => 'Collin Henderson',
        'email' => 'collinpatrickhenderson@gmail.com',
        'github_username' => 'syropian'
      ]
    );
    BetaUser::create(
      [
        'full_name' => 'Daniel Hritzkiv',
        'email' => 'daniel.hritzkiv@gmail.com',
        'github_username' => 'dhritzkiv'
      ]
    );
    BetaUser::create(
      [
        'full_name' => 'Paul Unr Morrison',
        'email' => 'paul.unr@gmail.com',
        'github_username' => 'unr'
      ]
    );
    BetaUser::create(
      [
        'full_name' => 'Andy Ngo',
        'email' => 'andyngoszewee@gmail.com',
        'github_username' => 'andyngo'
      ]
    );
    BetaUser::create(
      [
        'full_name' => 'Alexander Zielenski',
        'email' => 'alex@alexzielenski.com',
        'github_username' => 'alexzielenski'
      ]
    );
    BetaUser::create(
      [
        'full_name' => 'ELLIOTT CABLE',
        'email' => 'astralapp-beta@elliottcable.com',
        'github_username' => 'ELLIOTTCABLE'
      ]
    );
    BetaUser::create(
      [
        'full_name' => 'Jon Marus',
        'email' => 'jon@bluerootmedia.com',
        'github_username' => 'jmarus'
      ]
    );
    BetaUser::create(
      [
        'full_name' => 'Brad Cerasani',
        'email' => 'bradcerasani@gmail.com',
        'github_username' => 'bradcerasani'
      ]
    );
    BetaUser::create(
      [
        'full_name' => 'Michael Hasselbring',
        'email' => 'me@michaelhasselbring.com',
        'github_username' => 'mikelbring'
      ]
    );
    BetaUser::create(
      [
        'full_name' => 'Ed Wellbrook',
        'email' => 'edwellbrook@gmail.com',
        'github_username' => 'edwellbrook'
      ]
    );
    BetaUser::create(
      [
        'full_name' => 'Ian DesJardins',
        'email' => 'ian.d.desjardins@gmail.com',
        'github_username' => 'iandesj'
      ]
    );
    BetaUser::create(
      [
        'full_name' => 'Lance Ruegger',
        'email' => 'lance.k.ruegger@gmail.com',
        'github_username' => 'lancekruegger'
      ]
    );
    BetaUser::create(
      [
        'full_name' => 'Salman',
        'email' => 'salmankaleem94@gmail.com',
        'github_username' => 'salmankaleem5'
      ]
    );
    BetaUser::create(
      [
        'full_name' => 'Lukas Lücke',
        'email' => 'lukas@luecke.me',
        'github_username' => 'lukasluecke'
      ]
    );
    BetaUser::create(
      [
        'full_name' => 'Paul Mcloughlin',
        'email' => 'cloggy45@googlemail.com',
        'github_username' => 'cloggy45'
      ]
    );
    BetaUser::create(
      [
        'full_name' => 'Case Prince',
        'email' => 'caseprince@gmail.com',
        'github_username' => 'caseprince'
      ]
    );
    BetaUser::create(
      [
        'full_name' => 'James Wyse',
        'email' => 'james@jameswyse.net',
        'github_username' => 'jameswyse'
      ]
    );
    BetaUser::create(
      [
        'full_name' => 'Chris Mendis',
        'email' => 'chris.mendis@gmail.com',
        'github_username' => 'chrismendis'
      ]
    );
    BetaUser::create(
      [
        'full_name' => 'Mateusz Wijas',
        'email' => 'mateusz.wijas@gmail.com',
        'github_username' => 'mateuszwijas'
      ]
    );
    BetaUser::create(
      [
        'full_name' => 'Wesley Moxam',
        'email' => 'wes@wmoxam.com',
        'github_username' => 'wmoxam'
      ]
    );
    BetaUser::create(
      [
        'full_name' => 'Astral Test',
        'email' => 'hello@astralapp.com',
        'github_username' => 'astraltest'
      ]
    );

  }

}