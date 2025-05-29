<template>
  <div class="home-container">
    <h1>مرحباً بك في الصفحة الرئيسية</h1>
    <p>تم تسجيل الدخول بنجاح!</p>
  </div>
</template>

<script setup>
console.log('Home page loaded')
</script>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.08);
  margin: 2rem auto;
  max-width: 500px;
}
h1 {
  color: #4CAF50;
  margin-bottom: 1rem;
}
p {
  color: #333;
}
</style> 