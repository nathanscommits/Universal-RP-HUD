function rand(max) {
    return 1 + Math.floor(Math.random() * (max - 1));
  }
  
  exports.roll = () => {
    return rand(100);
  };
  