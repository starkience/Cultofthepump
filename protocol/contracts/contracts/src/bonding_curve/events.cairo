use cubit::f256::Fixed;
#[derive(Drop, starknet::Event)]
pub struct BondingCurveInitialized {
    pub a: Fixed,
    pub k: Fixed,
}
