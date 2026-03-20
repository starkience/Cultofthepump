pub mod math;
pub mod procgen;
mod test;
pub mod types;

pub use types::fixed::{Fixed, FixedPrint, FixedTrait, ONE, ONE_u128};
pub use types::vec2::{Vec2, Vec2Print, Vec2Trait};
pub use types::vec3::{Vec3, Vec3Print, Vec3Trait};
pub use types::vec4::{Vec4, Vec4Print, Vec4Trait};

pub use math::{comp, hyp, ops, trig};
pub use procgen::{rand, simplex3};
