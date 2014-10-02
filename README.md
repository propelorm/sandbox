# PropelSandbox (sandbox.propelorm.org)

## Install

1. Install the bundle into AppKernel
2. Import its config and routing.yml
3. Configure your system
```
useradd sandbox --home /home/sandbox
echo 'www-data ALL= NOPASSWD: /var/www/propelsandbox/src/PropelSandbox/Resources/meta/jail.sh' >> /etc/sudoers // or sudo visudo
iptables -I OUTPUT -j REJECT -m owner --gid-owner sandbox
```
4. make sure `/var/www/propelsandbox/src/PropelSandbox/Resources/meta/jail.sh` is only writeable by root!
5. fire `bower install` in `src/PropelSandbox`
6. make sure /tmp/propelsandbox is writeable by your web server
7. Make sure all dependencies are set up. See @propelorm/sandbox-vagrant/bootstrap.sh for more information.