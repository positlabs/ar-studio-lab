
/*
    https://www.facebook.com/groups/289750598103656/337444020000980/?hc_location=ufi
*/

var S = require('Scene');
var FT = require('FaceTracking');
var R = require('Reactive');
var D = require('Diagnostics');
var A = require('Animation');

const face = FT.face(0);

var bodyTransform = getBodyTransform(face, 5, 20, 15);
var body = scene.root.find('body');
updateTransformFromState(body, bodyTransform);

function getBodyRotator(faceRotation, defaultMultiplier, minHeadRotation, maxHeadRotation) {
    var maxRatio = R.max(defaultMultiplier,
        FT.count.lt(1).or(faceRotation.eq(0)).ifThenElse(
            defaultMultiplier,
            faceRotation.lt(0).ifThenElse(
                faceRotation.sub(toRadians(minHeadRotation)),
                faceRotation.sub(toRadians(maxHeadRotation))).div(faceRotation)));
    return maxRatio.mul(faceRotation);
}

function getBodyTransform(face) {
    var bodyTranslateSmooth = 20;
    var bodyRotationSmooth = 25;
    var defaultRotationXMultiplier = 0.15;
    var defaultRotationYMultiplier = 0.25;
    var defaultRotationZMultiplier = 0.15;
    var minHeadRotationX = -15;
    var maxHeadRotationX = 10;
    var maxHeadRotationY = 15;
    var maxHeadRotationZ = 20;
    var baseOfNeck = calculateBaseOfNeck(face);
    return {
        x: baseOfNeck.x.expSmooth(bodyTranslateSmooth),
        y: baseOfNeck.y.expSmooth(bodyTranslateSmooth),
        z: baseOfNeck.z.expSmooth(bodyTranslateSmooth),
        rotationX: getBodyRotator(face.transform.rotationX, defaultRotationXMultiplier, minHeadRotationX, maxHeadRotationX).expSmooth(bodyRotationSmooth),
        rotationY: getBodyRotator(face.transform.rotationY, defaultRotationYMultiplier, -maxHeadRotationY, maxHeadRotationY).expSmooth(bodyRotationSmooth),
        rotationZ: getBodyRotator(face.transform.rotationZ, defaultRotationZMultiplier, -maxHeadRotationZ, maxHeadRotationZ).expSmooth(bodyRotationSmooth)
    };
}

function calculateBaseOfNeck(face) {
    var faceToCenterOfHeadDepth = 120;
    var centerOfHeadToBaseOfNeck = 50;
    return {
        x: face.transform.x
            .sub(R.sin(face.transform.rotationY).mul(faceToCenterOfHeadDepth).mul(1))
            .sum(R.sin(face.transform.rotationZ).mul(centerOfHeadToBaseOfNeck).mul(0.75))
            .sub(R.sin(face.transform.rotationZ).mul(R.sin(face.transform.rotationX))
                .mul(centerOfHeadToBaseOfNeck)),
        y: face.transform.y
            .sum(R.sin(face.transform.rotationX).mul(faceToCenterOfHeadDepth).mul(0.8))
            .sub(R.cos(face.transform.rotationZ).mul(centerOfHeadToBaseOfNeck).mul(0.5)),
        z: face.transform.z.sub(R.val(faceToCenterOfHeadDepth))
            .sum(R.sin(face.transform.rotationX).abs().mul(faceToCenterOfHeadDepth / 4))
            .sum(R.sin(face.transform.rotationY).abs().mul(faceToCenterOfHeadDepth / 3))
    };
}

function updateTransformFromState(object, state) {
    object.transform.x = state.x;
    object.transform.y = state.y;
    object.transform.z = state.z;
    object.transform.rotationX = state.rotationX;
    object.transform.rotationY = state.rotationY;
    object.transform.rotationZ = state.rotationZ;
}

function toRadians(angle) {
    return angle * (Math.PI / 180);
}