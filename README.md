# Test items list managing app
To run using terminal run from app root folder:
```
sudo sh ./startup.sh
```
Then after message "Now visit: http://localhost:1337" visit
 http://localhost:1337 in browser


To stop and remove all docker containers
```
sudo docker stop $(docker ps -a -q) && docker rm $(docker ps -a -q)
```