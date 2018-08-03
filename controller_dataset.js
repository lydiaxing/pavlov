var tf = require('@tensorflow/tfjs');

class ControllerDataset {
  addExample(example, label) {
    var y = tf.tidy(() => tf.oneHot(tf.tensor1d([label]), numClasses));

    if (this.xs == null) {
      this.xs = tf.keep(example);
      this.ys = tf.keep(y);
    } else {
      var oldX = this.xs;
      this.xs = tf.keep(oldX.concat(example, 0));

      var oldY = this.ys;
      this.ys = tf.keep(oldY.concat(y, 0));

      oldX.dispose();
      oldY.dispose();
      y.dispose();
    }
  }
}

module.exports.ControllerDataset = ControllerDataset;
