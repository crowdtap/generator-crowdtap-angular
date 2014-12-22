set -x
set -e
if [ ! -e firefox ]; then
  wget https://s3.amazonaws.com/crowdtap-ci/firefox-30.0.tar.bz2
  tar -xjf firefox-30.0.tar.bz2
fi
sudo rm -rf  /opt/firefox
sudo rm -rf  /usr/bin/firefox
sudo cp -r firefox /opt/firefox30
sudo ln -s /opt/firefox30/firefox /usr/bin/firefox;