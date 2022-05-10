window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('button2').onclick = function () {
    console.log('button2--->', window.commonAPI.getNumber())
  }
})
