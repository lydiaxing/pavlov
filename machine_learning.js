var tf = require('@tensorflow/tfjs');
var controllerDataset = require('./controller_dataset');

var numClasses = 2;
var denseUnits = 100;
var batchFraction = .4;
var epochs = 20;
var learningRate = 0.0001;
var isPredicting = false;
var model;
var mobilenet;

function processImage(img) {
  return tf.tidy((img) => {
    var img = tf.fromPixels(img);
    var cropped = cropImage(img);
    var batched = cropped.expandDims(0);
    return batched.toFloat().div(tf.scalar(127)).sub(tf.scalar(1));
  });
}

function cropImage(img) {
  var size = Math.min(img.shape[0], img.shape[1]);
  var centerHeight = img.shape[0] / 2;
  var beginHeight = centerHeight - (size / 2);
  var centerWidth = img.shape[1] / 2;
  var beginWidth = centerWidth - (size / 2);
  return img.slice([
    beginHeight, beginWidth, 0
  ], [size, size, 3]);
}

function handleExample(img) {
  console.log("handling exampes");
  tf.tidy(() => {
    controllerDataset.addExample(mobilenet.predict(img), label);
  });
};

async function loadMobilenet() {
  var mobilenet = await tf.loadModel('https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json');
  var layer = mobilenet.getLayer('conv_pw_13_relu');
  return tf.model({inputs: model.inputs, outputs: layer.output});
};

async function train() {
  model = tf.sequential({
    layers: [
      tf.layers.flatten({inputShape: [7, 7, 256]}),
      tf.layers.dense({
        units: denseUnits,
        activation: 'relu',
        kernelInitializer: 'varianceScaling',
        useBias: true
      }),
      tf.layers.dense({
        units: numClasses,
        kernelInitializer: 'varianceScaling',
        useBias: false,
        activation: 'softmax'
      })
    ]
  });

  var optimizer = tf.train.adam(learningRate);
  model.compile({optimizer: optimizer, loss: 'categoricalCrossentropy'});
  var batchSize = Math.floor(controllerDataset.xs.shape[0] * batchFraction);

  model.fit(controllerDataset.xs, controllerDataset.ys, {
    batchSize,
    epochs: epochs,
    callbacks: {
      onBatchEnd: async (batch, logs) => {
        console.log('Loss: ' + logs.loss.toFixed(5));
        await tf.nextFrame();
      }
    }
  });
};

async function predict(img) {
  while (isPredicting) {
    var predictedClass = tf.tidy(() => {
      var img = processImage(img);
      var activation = mobilenet.predict(img);
      var predictions = model.predict(activation);
      return predictions.as1D().argMax();
    });
    var classId = (await predictedClass.data())[0];
    predictedClass.dispose();
    await tf.nextFrame();
  }
}

module.exports = {
  processImage,
  cropImage,
  handleExample,
  loadMobilenet,
  train,
  predict
}
