## SETUP
run "rails db:migrate"\
run "rails db:encryption:init" which generates encryption keys for the password field of the user. Copy the generated keys. They look something like this:

active_record_encryption:\
  primary_key: one_primary_key\
  deterministic_key: one_deterministic_key\
  key_derivation_salt: one_key_derivation_salt\

run "rails credentials:edit"\
delete the credentials.yml.enc file in the config folder\
run "VISUAL="code --wait" bin/rails credentials:edit"\
paste the keys in the file, save, then close it.

## HOW TO RUN
Run the rails server by running "rails s", then run the node server with "nodemon node_server.js" in the console. The user should access localhost:8000 so sockets can be used.

## NOTE
I usually use ngrok which I then bind to localhost:8000, because sometimes rails redirects me to localhost:3000 even if I initially access localhost:8000. If you use ngrok, remember to add 'config.hosts << "your site name here"' to config/environments/development.rb
