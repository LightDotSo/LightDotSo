echo "Deploying factory script..."
echo $DEPLOY_RPC_URL

forge script contracts/script/LightWalletFactoryDeployer.s.sol \
    --tc LightWalletFactoryDeployer \
    -f $DEPLOY_RPC_URL \
    --sender 0x35da762a35FCb3160738EeCd60fa18438C273D5E \
    --broadcast -t
