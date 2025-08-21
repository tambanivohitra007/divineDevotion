<template>
  <div class="min-h-screen bg-white">
    <!-- Hero Section -->
    <section class="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 lg:pt-32 lg:pb-24">
        <div class="text-center">
          <!-- Logo/Icon -->
          <div class="flex justify-center mb-8">
            <div class="w-16 h-16 bg-primary-500 rounded-xl flex items-center justify-center animate-float">
              <i class="bi bi-stars text-2xl text-white"></i>
            </div>
          </div>
          
          <!-- Headline -->
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 animate-fade-in">
            Divine Devotion
            <span class="block text-primary-600">for Modern Faith</span>
          </h1>
          
          <!-- Subheading -->
          <p class="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed animate-slide-up">
            Transform your spiritual journey with AI-powered devotions, biblical insights, and faith-based content tailored to your daily walk with God.
          </p>
          
          <!-- CTA Button -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up">
            <button class="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              Get Started
            </button>
            <button class="text-primary-600 hover:text-primary-700 px-8 py-4 font-semibold text-lg transition-colors duration-300 flex items-center gap-2">
              Watch Demo
              <i class="bi bi-play-circle"></i>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Background decoration -->
      <div class="absolute inset-0 -z-10">
        <div class="absolute top-0 right-0 w-96 h-96 bg-primary-100 rounded-full opacity-50 blur-3xl"></div>
        <div class="absolute bottom-0 left-0 w-96 h-96 bg-primary-50 rounded-full opacity-50 blur-3xl"></div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-16 lg:py-24 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Everything you need for spiritual growth
          </h2>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful tools to deepen your faith and enhance your spiritual journey
          </p>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div class="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
              <i class="bi bi-stars text-2xl text-primary-600"></i>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-4">AI-Powered Devotions</h3>
            <p class="text-gray-600 leading-relaxed">
              Generate personalized daily devotions that speak to your heart and current life circumstances.
            </p>
          </div>
          
          <!-- Feature 2 -->
          <div class="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
              <i class="bi bi-book-half text-2xl text-primary-600"></i>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-4">Biblical Exegesis</h3>
            <p class="text-gray-600 leading-relaxed">
              Deep scriptural analysis and interpretation to enhance your understanding of God's word.
            </p>
          </div>
          
          <!-- Feature 3 -->
          <div class="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
              <i class="bi bi-card-image text-2xl text-primary-600"></i>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-4">Bible Cards</h3>
            <p class="text-gray-600 leading-relaxed">
              Beautiful, shareable cards featuring scripture verses and inspirational messages.
            </p>
          </div>
          
          <!-- Feature 4 -->
          <div class="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
              <i class="bi bi-lightbulb text-2xl text-primary-600"></i>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-4">Faith Integration</h3>
            <p class="text-gray-600 leading-relaxed">
              Connect your faith with learning and daily activities for a more integrated spiritual life.
            </p>
          </div>
          
          <!-- Feature 5 -->
          <div class="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
              <i class="bi bi-globe text-2xl text-primary-600"></i>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-4">Multi-Language Support</h3>
            <p class="text-gray-600 leading-relaxed">
              Access spiritual content in multiple languages to reach believers worldwide.
            </p>
          </div>
          
          <!-- Feature 6 -->
          <div class="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
              <i class="bi bi-collection text-2xl text-primary-600"></i>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-4">Save & Organize</h3>
            <p class="text-gray-600 leading-relaxed">
              Keep your favorite devotions and insights organized for future reference and study.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Demo Section -->
    <section class="py-16 lg:py-24 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            See it in action
          </h2>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience the power of AI-driven spiritual content creation
          </p>
        </div>
        
        <!-- Demo Container -->
        <div class="max-w-4xl mx-auto">
          <div class="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <!-- Demo Header -->
            <div class="bg-gray-900 px-6 py-4 flex items-center gap-3">
              <div class="flex gap-2">
                <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div class="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div class="text-gray-400 text-sm">Divine Devotion App</div>
            </div>
            
            <!-- Demo Content -->
            <div class="aspect-video bg-gradient-to-br from-primary-50 to-gray-50 flex items-center justify-center relative">
              <div class="text-center p-8">
                <div class="w-24 h-24 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <i class="bi bi-play-fill text-4xl text-white"></i>
                </div>
                <h3 class="text-2xl font-bold text-gray-900 mb-4">Interactive Demo</h3>
                <p class="text-gray-600 mb-6">Click to see how Divine Devotion works</p>
                <button class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300">
                  Launch Demo
                </button>
              </div>
              
              <!-- Floating elements -->
              <div class="absolute top-4 right-4 bg-white rounded-lg p-3 shadow-lg animate-float" style="animation-delay: 0.5s;">
                <i class="bi bi-stars text-primary-600"></i>
              </div>
              <div class="absolute bottom-4 left-4 bg-white rounded-lg p-3 shadow-lg animate-float" style="animation-delay: 1s;">
                <i class="bi bi-heart-fill text-red-500"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section class="py-16 lg:py-24 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Trusted by believers worldwide
          </h2>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            See how Divine Devotion is transforming spiritual journeys
          </p>
        </div>
        
        <div class="grid md:grid-cols-3 gap-8">
          <!-- Testimonial 1 -->
          <div class="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <div class="flex items-center mb-4">
              <div class="flex text-yellow-400">
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
              </div>
            </div>
            <blockquote class="text-gray-700 mb-6 leading-relaxed">
              "Divine Devotion has revolutionized my daily quiet time. The personalized devotions speak directly to my heart and current situations."
            </blockquote>
            <div class="flex items-center">
              <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                <i class="bi bi-person-fill text-primary-600"></i>
              </div>
              <div>
                <div class="font-semibold text-gray-900">Sarah Johnson</div>
                <div class="text-gray-600 text-sm">Pastor, Community Church</div>
              </div>
            </div>
          </div>
          
          <!-- Testimonial 2 -->
          <div class="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <div class="flex items-center mb-4">
              <div class="flex text-yellow-400">
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
              </div>
            </div>
            <blockquote class="text-gray-700 mb-6 leading-relaxed">
              "The biblical exegesis feature has deepened my understanding of Scripture in ways I never imagined. Truly a blessing!"
            </blockquote>
            <div class="flex items-center">
              <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                <i class="bi bi-person-fill text-primary-600"></i>
              </div>
              <div>
                <div class="font-semibold text-gray-900">Michael Chen</div>
                <div class="text-gray-600 text-sm">Seminary Student</div>
              </div>
            </div>
          </div>
          
          <!-- Testimonial 3 -->
          <div class="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <div class="flex items-center mb-4">
              <div class="flex text-yellow-400">
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
              </div>
            </div>
            <blockquote class="text-gray-700 mb-6 leading-relaxed">
              "As a busy mom, having AI-generated devotions that fit my schedule and speak to my challenges has been life-changing."
            </blockquote>
            <div class="flex items-center">
              <div class="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                <i class="bi bi-person-fill text-primary-600"></i>
              </div>
              <div>
                <div class="font-semibold text-gray-900">Emily Rodriguez</div>
                <div class="text-gray-600 text-sm">Mother & Bible Study Leader</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Call-to-Action Section -->
    <section class="py-16 lg:py-24 bg-primary-600">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl sm:text-4xl font-bold text-white mb-4">
          Ready to transform your spiritual journey?
        </h2>
        <p class="text-xl text-primary-100 mb-8 max-w-2xl mx-auto leading-relaxed">
          Join thousands of believers who are deepening their faith with Divine Devotion
        </p>
        
        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button class="bg-white hover:bg-gray-50 text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
            Start Your Journey
          </button>
          <button class="text-white hover:text-primary-100 px-8 py-4 font-semibold text-lg transition-colors duration-300 flex items-center gap-2">
            Learn More
            <i class="bi bi-arrow-right"></i>
          </button>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid md:grid-cols-4 gap-8">
          <!-- Brand -->
          <div class="md:col-span-2">
            <div class="flex items-center mb-4">
              <div class="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center mr-3">
                <i class="bi bi-stars text-white"></i>
              </div>
              <span class="text-xl font-bold">Divine Devotion</span>
            </div>
            <p class="text-gray-400 mb-6 max-w-md">
              Empowering believers with AI-driven spiritual content for deeper faith and meaningful growth.
            </p>
            
            <!-- Social Icons -->
            <div class="flex gap-4">
              <a href="#" class="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors duration-300">
                <i class="bi bi-twitter text-gray-400 hover:text-white"></i>
              </a>
              <a href="#" class="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors duration-300">
                <i class="bi bi-facebook text-gray-400 hover:text-white"></i>
              </a>
              <a href="#" class="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors duration-300">
                <i class="bi bi-instagram text-gray-400 hover:text-white"></i>
              </a>
              <a href="#" class="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors duration-300">
                <i class="bi bi-youtube text-gray-400 hover:text-white"></i>
              </a>
            </div>
          </div>
          
          <!-- Quick Links -->
          <div>
            <h3 class="font-semibold mb-4">Product</h3>
            <ul class="space-y-2 text-gray-400">
              <li><a href="#" class="hover:text-white transition-colors duration-300">Features</a></li>
              <li><a href="#" class="hover:text-white transition-colors duration-300">Pricing</a></li>
              <li><a href="#" class="hover:text-white transition-colors duration-300">Demo</a></li>
              <li><a href="#" class="hover:text-white transition-colors duration-300">API</a></li>
            </ul>
          </div>
          
          <!-- Support -->
          <div>
            <h3 class="font-semibold mb-4">Support</h3>
            <ul class="space-y-2 text-gray-400">
              <li><a href="#" class="hover:text-white transition-colors duration-300">About</a></li>
              <li><a href="#" class="hover:text-white transition-colors duration-300">Contact</a></li>
              <li><a href="#" class="hover:text-white transition-colors duration-300">Privacy</a></li>
              <li><a href="#" class="hover:text-white transition-colors duration-300">Terms</a></li>
            </ul>
          </div>
        </div>
        
        <!-- Bottom Bar -->
        <div class="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div class="text-gray-400 text-sm">
            © 2024 Divine Devotion. All rights reserved.
          </div>
          <div class="text-gray-400 text-sm mt-4 md:mt-0">
            Built with ❤️ for the Kingdom of God
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
// Component logic can be added here if needed
</script>

<style scoped>
/* Custom animations and styles if needed beyond Tailwind */
</style>