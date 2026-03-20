pub mod math;
pub mod procgen;
mod test;
pub mod types;

pub use types::fixed::{Fixed, FixedTrait, FixedPrint, HALF, ONE, TWO};
pub use types::vec2::{Vec2, Vec2Trait, Vec2Print};
pub use types::vec3::{Vec3, Vec3Trait, Vec3Print};
pub use types::vec4::{Vec4, Vec4Trait, Vec4Print};

pub use math::{comp, hyp, ops, trig};
pub use procgen::{rand, simplex3};
