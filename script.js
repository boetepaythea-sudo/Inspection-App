import {initializeApp} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
            import {getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
            import {getFirestore, collection, addDoc, getDocs, deleteDoc, doc, getDoc, setDoc, writeBatch} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

            const firebaseConfig = {
                apiKey: "AIzaSyAdjD2FiCU-uP5eo8JuKyP_Gc_QNGpAPK8",
                authDomain: "inspection-data-11f7d.firebaseapp.com",
                projectId: "inspection-data-11f7d",
                storageBucket: "inspection-data-11f7d.firebasestorage.app",
                messagingSenderId: "1082215196163",
                appId: "1:1082215196163:web:fdaa360881782ea3ad1036",
                measurementId: "G-KBV92YDP1K"
            };

            const app = initializeApp(firebaseConfig);
            const auth = getAuth(app);
            const db = getFirestore(app);
            let isDashboardAdmin = false;

            async function refreshDashboardAdminAccess(user) {
                isDashboardAdmin = false;
                const uploadButton = document.getElementById("dashboardUploadTabButton");
                if (uploadButton) uploadButton.style.display = "none";
                if (!user) return false;
                try {
                    // Role ditetapkan melalui dokumen Firestore userRoles/{UID}, bukan sekadar karena akun bisa login.
                    const roleSnapshot = await getDoc(doc(db, "userRoles", user.uid));
                    isDashboardAdmin = roleSnapshot.exists() && String(roleSnapshot.data()?.role || "").toLowerCase() === "admin";
                    if (uploadButton) uploadButton.style.display = isDashboardAdmin ? "inline-block" : "none";
                } catch (error) {
                    console.error("Gagal memeriksa role admin dashboard:", error);
                    isDashboardAdmin = false;
                }
                return isDashboardAdmin;
            }

            window.toggleMenu = () => {
                const sidebar = document.getElementById("sidebar");
                const overlay = document.getElementById("sidebarOverlay");
                const toggleButton = document.querySelector(".mobile-menu-toggle");
                if (!sidebar) return;
                const isOpen = sidebar.classList.toggle("show");
                if (overlay) overlay.classList.toggle("show", isOpen);
                if (toggleButton) toggleButton.setAttribute("aria-expanded", String(isOpen));
                document.body.style.overflow = isOpen && window.matchMedia("(max-width: 768px)").matches ? "hidden" : "";
            };

            window.showQualityGuideTab = (tabId) => {
                if (tabId === "dashboardUploadPanel" && !isDashboardAdmin) {
                    alert("Menu Upload Data Dashboard hanya dapat diakses oleh admin.");
                    return;
                }
                const panels = document.querySelectorAll("#qualityGuide .quality-guide-panel");
                panels.forEach(panel => {
                    panel.style.display = panel.id === tabId ? "block" : "none";
                });
            };

            window.showSection = (id) => {
                // ===============================
                // 🔐 VALIDASI AKSES STEP1
                // ===============================
                if (id === "step1") {
                    const user = auth.currentUser;
                    if (user) {
                        const username = user.email.split("@")[0].toLowerCase().trim();

                        if (!allowedInputUsers.includes(username)) {
                            alert("You do not have access to the Data Input menu!");
                            return; // STOP here, don't continue
                        }
                    }
                }
                document.querySelectorAll("main section, .step1-container").forEach(sec => sec.style.display = "none");
                const el = document.getElementById(id);
                if (el) el.style.display = "block";

                if (window.matchMedia("(max-width: 768px)").matches) {
                    const sidebar = document.getElementById("sidebar");
                    const overlay = document.getElementById("sidebarOverlay");
                    const toggleButton = document.querySelector(".mobile-menu-toggle");
                    if (sidebar) sidebar.classList.remove("show");
                    if (overlay) overlay.classList.remove("show");
                    if (toggleButton) toggleButton.setAttribute("aria-expanded", "false");
                    document.body.style.overflow = "";
                }

                if (id === "qualityGuide") {
                    showQualityGuideTab("aqlSection");
                }

                // ===============================
                // RUNNING TEXT CONTROL
                // ===============================
                const runningText = document.getElementById("runningText");
                if (runningText) {
                    runningText.style.display = (id === "dashboard") ? "block" : "none";
                }
                if (runningText) {
                    runningText.style.display = (id === "dashboard") ? "flex" : "none";
                }

                // Dashboard memakai koleksi khusus dashboardData.
                // Data PO dan Inspection yang lain tidak dibaca atau diubah di sini.
                if (id === 'dashboard') {
                    loadDashboardData();
                }
            };

            function openExternal(link) {
                // sembunyikan semua section internal
                document.querySelectorAll("section").forEach(s => s.style.display = "none");
                // tampilkan iframe dan set link
                const iframe = document.getElementById("externalView");
                iframe.src = link;
                iframe.style.display = "block";
            }

            function backToSection(sectionId) {
                // sembunyikan iframe
                const iframe = document.getElementById("externalView");
                iframe.style.display = "none";
                iframe.src = "";
                // tampilkan section yang diinginkan
                document.getElementById(sectionId).style.display = "block";
            }

            document.getElementById("poPrintBtn").addEventListener("click", () => {
                window.location.href = "https://jeffanind.github.io/Purchase-Order";
            });

            document.getElementById('galleryMenu').addEventListener('click', function () {
                window.location.href = "https://jeffanind.github.io/Gallery-Item-Product";
            });
            document.getElementById('shipmentMenu').addEventListener('click', function () {
                window.location.href = "https://jeffanind.github.io/Shipping-Dashboard";
            });

            //-- FUNCTION CLOCK UPDATE -->
            document.addEventListener("DOMContentLoaded", function () {
                function updateClock() {
                    const now = new Date();

                    const hours = String(now.getHours()).padStart(2, '0');
                    const minutes = String(now.getMinutes()).padStart(2, '0');
                    const seconds = String(now.getSeconds()).padStart(2, '0');

                    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

                    const dayName = days[now.getDay()];
                    const date = now.getDate();
                    const month = months[now.getMonth()];
                    const year = now.getFullYear();

                    document.getElementById("clock-time").textContent =
                        `${hours}:${minutes}:${seconds}`;

                    document.getElementById("clock-date").textContent =
                        `${dayName}, ${date} ${month} ${year}`;
                }

                setInterval(updateClock, 1000);
                updateClock();
            });

            /* ================= MASTER DATA PO DARI FIREBASE =================
             * Sumber PO: collection Firestore "purchaseOrders"
             * Struktur yang digunakan: po, Vendor/vendor, ecrd/ECRD, items[]
             */
            let dataByKode = {};

            async function loadMasterPOFromFirebase() {
                try {
                    const snapshot = await getDocs(collection(db, "purchaseOrders"));
                    const firebaseData = {};

                    snapshot.forEach(docSnap => {
                        const d = docSnap.data() || {};
                        const po = String(d.po || docSnap.id || "").trim();
                        if (!po) return;

                        firebaseData[po] = {
                            Vendor: d.Vendor || d.vendor || "",
                            ecrd: d.ecrd || d.ECRD || "",
                            items: Array.isArray(d.items) ? d.items : []
                        };
                    });

                    dataByKode = firebaseData;
                    console.log(`Master PO berhasil dimuat dari Firebase: ${Object.keys(dataByKode).length} PO`);
                } catch (error) {
                    console.error("Gagal membaca Master PO dari Firebase:", error);
                    dataByKode = {};
                    alert("Master PO gagal dimuat dari Firebase. Silakan cek koneksi dan Firebase Rules.");
                }
            }

            // Pastikan Master PO selesai dimuat sebelum Step 1 dan menu Purchase Order digunakan.
            await loadMasterPOFromFirebase();

            const guideTexts = {
                guideInput: `
    <h3>📌 Panduan: Input Data Inspection</h3>
    <p>
        <p><strong>A. STEP 1 Buat Header</strong></p>
        1. Select Vendor yang ingin di inspeksi.<br>
        2. Select PO yang ingin di inspeksi.<br>
        3. Input Qty Inspect.<br>
        4. Select Inspector.<br>
        5. Select Date.<br>
        6. Klil tombol “Save Header”.<br>
        7. Jangan menghapus data Header jika ada data inputan section.<br>

        <p><strong>B. STEP 2 Lanjutkan Input</strong></p>
        1. Select check Box di Tabel Data Header salah satunya.<br>
        2. Klik Go to step 2.<br>
        3. Select Item.<br>
        4. Select Inspection Section.<br>
        5. Select Choose Files Untuk ambil Foto langsung atau dari gallery yang sudah tersimpan.<br>
        6. Input Inspection Report.<br>
        7. Klik “Save Section”.<br>
        8. Ulangi proses dari no 3 s.d 7 hingga proses input data inspection selesai.<br>
        9. Hasilnya tampil di tabel dan juga untuk data All ada di menu Inventory Data Inspection.<br>
    </p>
  `,
                guideInventory: `
    <h3>📌 Panduan: Inventory Data Inspection</h3>
    <p>
      1. Gunakan filter Vendor dan PO untuk melihat data inventory.<br>
      2. Data akan tampil di tabel inventory sesuai yg di pilih.<br>
      3. Gunakan tombol Export PDF & Excell untuk cetak laporan.
    </p>
  `,
                guideGallery: `
    <h3>📌 Panduan: Gallery Item Product</h3>
    <p>
      1. Pilih kode item dari dropdown.<br>
      2. Gunakan Search untuk menyaring kategori atau kode.<br>
      3. Klik tombol Next / Previous untuk navigasi gambar.
     
    </p>
  `,
                guidePO: `
    <h3>📌 Panduan: Purchase Order Data</h3>
    <p>
      1. Cari PO dengan input atau dropdown PO.<br>
      2. Gunakan tombol Next / Previous untuk navigasi PO.<br>
      3. Data PO dan gambar akan tampil di bawah.<br>
      4. Klik gambar PO untuk memperbesar.
    </p>
  `,
                guideInspek: `
    <h3>📌 Panduan: Guide Inspection Process</h3>
    <p>
      1. Klik menu Guide inspection process.<br>
      2. Pilih Guide yang akan di lihat.<br>
    </p>
  `,
                guidelines: `
      <h3>📌 Standard Inspection Guidelines</h3>
      <p>
      <p><strong>A. Menerapkan Standar Kualitas yang Efektif untuk Mengurangi Masalah Kualitas dan Cacat Produk</strong></p>
      <p>Kontrol kualitas merupakan bagian penting dari produksi furnitur untuk memastikan furnitur Anda dikirim dalam kondisi sempurna. Pastikan mengikuti sistem kontrol kualitas ini, yang merupakan praktik terbaik untuk memastikan persyaratan kualitas yang digunakan dalam produksi memenuhi standar tertinggi.</p>
      
      <p><strong>B. Kontrol Kualitas dalam Pembuatan Furnitur dan Cara Menghindari Kualitas Buruk</strong></p>
      <p>Dalam hal produksi furnitur, ada beberapa faktor utama yang memainkan peran krusial dalam memastikan produk berkualitas tinggi di industri furnitur.
      <p>Proses manufaktur merupakan proses yang kompleks, dimulai dari pemilihan bahan baku berkualitas hingga produksi furnitur. Memahami keseluruhan proses sangat penting untuk meningkatkan kualitas furnitur dan mengurangi risiko cacat produksi. Pastikan senantiasa mengedukasi para pengrajin / vendor tentang cara meningkatkan kualitas produk dan memastikan furnitur yang di buat berkualitas tinggi dan memenuhi standar kualitas.</p>
      <p><strong>C. Berikut adalah beberapa faktor yang perlu dipertimbangkan:</strong></p>
      
      <p><strong>1. Pemilihan bahan baku yang tepat:</strong></p>
                  -Pemilihan material sangat mempengaruhi kualitas furnitur, hanya menggunakan bahan berkualitas tinggi</P> 
                  -Semua bahan baku khususnya Kayu Jati dikeringkan di dalam oven hingga 3 minggu sebelum produksi dimulai. Dan bahan baku lainnya seperti rotan, capiz, coco, eceng, ilalang dan kaca di pastikan hanya menggunakan bahan baku dengan kualitas grade A dan B.</p>
      <p><strong>2. Kain pelapis:</strong></p>
                  - Semua kain diuji sepenuhnya termasuk pengujian mudah terbakar dan tahan api oleh pemasok, untuk memenuhi standar internasional mengenai:</p>
                    *Kekuatan Tarik: BS EN ISO 13934-11999</p>
                    *Ketahanan Sobek: BS EN ISO 13937-2 </p>
                    *Ketahanan Selip Jahitan: BS 3320 1998</p>
                    *Ketahanan Abrasi (gosok) BS EN ISO 12947-2</p> 
                    *Ketahanan Pilling: BS EN ISO 12945-1</p>
                    *Ketahanan Warna terhadap Gosok: BS EN ISO 105</p> 
                    *Ketahanan Warna terhadap Cahaya: BS 1006 B02 </p>
                    *Mudah terbakar: BS 5852 bagian 1 Rokok yang membara</p>
      <p><strong>3. Finsihing:</strong></p>
                  -Pastikan kualitas dan bahan baku finishing sesuai standard, untuk memastikan kualitas terbaik agar hasil lebih sempurna dan bagian dari proses akhir kesempurnaan produk yang di buat.</p>
      <p><strong>4. Perhatian terhadap detail:</strong></p>
                  -Kontrol kualitas sangat penting untuk memastikan perhatian terhadap detail selama proses produksi dipatuhi. Ini mencakup pengukuran, memastikan keselarasan yang tepat, dan penggunaan teknik yang presisi untuk penyambungan dan pelapis.</p>
      <p><strong>5. Komunikasi dan kolaborasi yang konsisten:</strong></p>
                  -Komunikasi dan kolaborasi yang efektif antar semua pihak yang terlibat dalam proses produksi sangatlah penting. Hal ini memastikan semua pihak memiliki pemahaman yang sama dan dapat segera mengatasi potensi masalah.</P>

                  <p><strong><em>Ingat, kualitas furnitur ditentukan sejak tahap produksi. Mempertimbangkan faktor-faktor ini akan membantu menciptakan furnitur berkualitas tinggi yang memuaskan pelanggan dan menjaga reputasi merek.</strong></em></p>

      `,
                guideinspectAbaca: `
    <h3>📌 Panduan: Sample Guide Inspections Process Item Abaca Table</h3>
    </p>
      Pedoman pengendalian mutu (QC) untuk meja kopi bundar anyaman abaca meliputi pemeriksaan kualitas material, pengerjaan, integritas struktural, penampilan, dan kepatuhan terhadap spesifikasi.</p>

      <p><strong>Daftar Periksa Pedoman QC.</strong></p>
      
      <p><strong>1. Pemeriksaan Bahan Baku</strong></p>
         - Kualitas Serat: Serat abaca harus diperiksa untuk keseragaman warna sesuai dengan grade, panjang yang konsisten (biasanya tidak kurang dari 60 cm), dan pengeringan yang tepat untuk mencegah jamur atau pembusukan.</p>
         - Kadar Air: Abaca dan rangka kayu internal apa pun harus memiliki kadar air yang sesuai untuk mencegah retak, melengkung, atau membengkak setelah produksi.</p>
         - Material Rangka: Jika rangka kayu atau logam digunakan, harus berasal dari pemasok yang bereputasi dan bebas dari cacat, memastikan kepatuhan terhadap standar keselamatan dan lingkungan.</p>
      
      <p><strong>2. Pemeriksaan Anyaman dan Pengerjaan</strong></p>
         - Konsistensi Anyaman: Pola anyaman abaca harus seragam dan rapat di seluruh permukaan meja.</p>
         - Tidak Ada Ujung/Serat yang Longgar: Periksa benang yang longgar, ujung yang berjumbai, atau serat yang tidak terpotong yang dapat memengaruhi penampilan atau daya tahan.</p>
         - Sambungan dan Jahitan: Semua sambungan di mana abaca bertemu dengan rangka atau di mana bagian-bagian yang berbeda bergabung harus terintegrasi sempurna tanpa celah atau ketidaksejajaran.</p>
      
      <p><strong>3. Pemeriksaan Finishing</strong></p>
         - Finishing Permukaan: Permukaan harus halus, bebas dari gerigi, tepi tajam, atau sobekan. Lapisan akhir (misalnya, lapisan bening, lilin) harus diaplikasikan secara merata tanpa gelembung, goresan, atau pengelupasan.</p>
         - Integritas Struktural dan Fungsionalitas Stabilitas: Meja kopi yang sudah jadi harus stabil dan kokoh. Lakukan pengecekan ketinggian lantai untuk memastikan meja tidak goyah.</p>
         - Uji Berat/Uji Beban: Verifikasi bahwa meja dapat menahan penggunaan normal dan beban berat yang dimaksudkan tanpa bengkok atau patah.</p>
         - Pengecekan Perakitan: Konfirmasi bahwa semua komponen terpasang dengan aman, tanpa bagian, sekrup, atau perangkat keras yang longgar.</p>
      
      <p><strong>4. Penampilan dan Kesesuaian Desain</strong></p>
         - Dimensi: Dimensi produk sebenarnya (tinggi, diameter bagian atas bundar) harus sesuai dengan spesifikasi desain dan persyaratan klien, dalam toleransi yang dapat diterima (misalnya, ±0,79 inci).</p>
         - Warna & Tekstur: Pastikan konsistensi warna dan tekstur secara keseluruhan dan antar batch produksi yang berbeda, dengan mengingat bahwa variasi alami adalah bagian normal dari proses pembacaan dan tidak dianggap sebagai cacat.</p>
         - Daya Tarik Estetika: Estetika keseluruhan harus diperiksa untuk mengetahui adanya cacat seperti goresan, penyok, perubahan warna, atau pudar yang mengurangi daya tarik produk.</p>
      
      <p><strong>5. Pengemasan dan Dokumentasi</strong></p>
         - Pelabelan/Penandaan: Pastikan semua pelabelan dan penandaan yang diperlukan ada dan benar.</p>
         - Pengemasan Pelindung: Pastikan pengemasan internal yang memadai (misalnya, bubble wrap, busa) untuk melindungi permukaan dan rangka abaca selama pengiriman, dan lakukan uji jatuh karton jika dipersyaratkan oleh standar pengiriman.</p>
         - Dokumentasi: Lengkapi semua laporan kontrol kualitas dan dokumentasi pengiriman yang diperlukan dengan akurat.</p>
    </p>
  `,
            };
            // ================= STEP 1 =================
            const rejectRules = [
                {minAql: 2, maxAql: 13, maxReject: 0},
                {minAql: 20, maxAql: 20, maxReject: 1},
                {minAql: 32, maxAql: 32, maxReject: 2},
                {minAql: 50, maxAql: 50, maxReject: 3}
            ];

            let headers = [];

            const vendorSelect = document.getElementById("vendorSelect");
            const poSelect = document.getElementById("poSelect");
            const saveHeaderBtn = document.getElementById("saveHeaderBtn");
            const backToMenuBtn = document.getElementById("backToMenuBtn");
            const filterVendor = document.getElementById("filterVendor");
            const filterPO = document.getElementById("filterPO");
            const headerTableBody = document.getElementById("headerTableBody");

            // Inisialisasi vendor di input form
            const allVendors = [...new Set(Object.values(dataByKode).map(po => po.Vendor))]
                .sort((a, b) => a.localeCompare(b, undefined, {numeric: true}));

            allVendors.forEach(v => {
                let opt = document.createElement("option");
                opt.value = v;
                opt.textContent = v;
                vendorSelect.appendChild(opt);
            });
            function getPOsByVendor(vendor) {return Object.keys(dataByKode).filter(po => dataByKode[po].Vendor === vendor);}
            vendorSelect.addEventListener("change", () => {
                poSelect.innerHTML = '<option value="">-- Select PO --</option>';
                const selectedVendor = vendorSelect.value;
                if (!selectedVendor) {poSelect.disabled = true; return;}
                getPOsByVendor(selectedVendor).forEach(po => {let opt = document.createElement("option"); opt.value = po; opt.textContent = po; poSelect.appendChild(opt);});
                poSelect.disabled = false;
            });

            // ================= FILTER HEADER =================
            function updateFilterVendor() {
                filterVendor.innerHTML = '<option value="">-- Select Vendor --</option>';
                const vendorsFromHeader = [...new Set(headers.map(h => h.vendor))];
                if (vendorsFromHeader.length === 0) {filterVendor.disabled = true; filterPO.disabled = true; headerTableBody.innerHTML = ""; return;}
                filterVendor.disabled = false;
                vendorsFromHeader.forEach(v => {let opt = document.createElement("option"); opt.value = v; opt.textContent = v; filterVendor.appendChild(opt);});
                // Reset PO filter
                filterPO.innerHTML = '<option value="">-- Select PO --</option>';
                filterPO.disabled = true;
                headerTableBody.innerHTML = "";
            }

            filterVendor.addEventListener("change", () => {
                const selVendor = filterVendor.value;
                filterPO.innerHTML = '<option value="">-- Select PO --</option>';
                if (!selVendor) {filterPO.disabled = true; headerTableBody.innerHTML = ""; return;}
                const posFromHeader = [...new Set(headers.filter(h => h.vendor === selVendor).map(h => h.po))];
                posFromHeader.forEach(po => {let opt = document.createElement("option"); opt.value = po; opt.textContent = po; filterPO.appendChild(opt);});
                filterPO.disabled = false;
                headerTableBody.innerHTML = "";
                renderTable();
            });

            filterPO.addEventListener("change", renderTable);

            // ================= AQL & RESULT =================
            function hitungAQL(qty) {
                if (qty >= 2 && qty <= 8) return 2;
                if (qty >= 9 && qty <= 15) return 3;
                if (qty >= 16 && qty <= 25) return 5;
                if (qty >= 26 && qty <= 50) return 8;
                if (qty >= 51 && qty <= 90) return 13;
                if (qty >= 91 && qty <= 150) return 20;
                if (qty >= 151 && qty <= 280) return 32;
                if (qty >= 281 && qty <= 500) return 50;
                return Math.ceil(qty * 0.2);
            }

            function hitungResult(aql, rejected) {const rule = rejectRules.find(r => aql >= r.minAql && aql <= r.maxAql); if (!rule) return "UNDEFINED"; return rejected <= rule.maxReject ? "APPROVED" : "FAILED";}

            // ================= LOAD HEADER DARI FIREBASE =================
            async function loadHeaders() {
                const snapshot = await getDocs(collection(db, "headers"));
                headers = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
                updateFilterVendor();
                renderTable();
            }
            loadHeaders();

            // ================= SAVE HEADER =================
            saveHeaderBtn.addEventListener("click", async () => {
                const vendor = vendorSelect.value;
                const po = poSelect.value;
                const inspector = document.getElementById("inspectorSelect").value;
                const date = document.getElementById("inspectDate").value;

                if (!vendor || !po || !inspector || !date) {return alert("Semua field harus diisi lengkap sebelum disimpan!");}

                const exists = headers.find(h => h.vendor === vendor && h.po === po);
                if (exists) return alert(`Data header untuk Vendor: ${vendor} dan PO: ${po} sudah tersimpan!`);

                const newHeader = {vendor, po, inspector, date, items: dataByKode[po]?.items || []};

                try {
                    const docRef = await addDoc(collection(db, "headers"), newHeader);
                    headers.push({id: docRef.id, ...newHeader});
                    alert("Header berhasil disimpan!");

                    // ✅ Reset semua input agar clean
                    vendorSelect.value = ""; poSelect.innerHTML = '<option value="">-- Select PO --</option>'; poSelect.disabled = true;
                    document.getElementById("inspectorSelect").value = "";
                    document.getElementById("inspectDate").value = "";

                    updateFilterVendor();
                    headerTableBody.innerHTML = ""; // tabel kosong dulu
                } catch (err) {console.error(err); alert("Gagal menyimpan ke Firebase. Cek console.");}
            });

            backToMenuBtn.addEventListener("click", () => showSection("dashboard"));

            // ================= DELETE HEADER =================
            window.deletePO = async function (po) {
                const headersToDelete = headers.filter(h => h.po === po);
                try {
                    for (let h of headersToDelete) {await deleteDoc(doc(db, "headers", h.id));}
                    headers = headers.filter(h => h.po !== po);
                    updateFilterVendor();
                    headerTableBody.innerHTML = "";
                    alert(`PO ${po} berhasil dihapus!`);
                } catch (err) {console.error(err); alert("Gagal menghapus PO. Cek console.");}
            }

            // ================= RENDER TABLE =================
            function renderTable() {
                const selVendor = filterVendor.value;
                const selPO = filterPO.value;
                headerTableBody.innerHTML = "";

                if (!selVendor && !selPO) return;

                let filtered = headers.filter(h => {
                    if (selVendor && h.vendor !== selVendor) return false;
                    if (selPO && h.po !== selPO) return false;
                    return true;
                });

                filtered.forEach(h => {
                    const items = h.items || [];
                    items.forEach(item => {
                        const tr = document.createElement("tr");
                        tr.innerHTML = `
                <td>${h.po}</td>
                <td><img src="${item.image}" width="50"></td>
                <td>${item.item}</td>
                <td>${item.desc}</td>
                <td>${item.qty}</td>
                <td>${h.qtyAQL || hitungAQL(item.qty)}</td>
                <td>
                    <button onclick="goToStep2('${h.po}','${item.item}')">Go to Step 2</button>
                    <button onclick="deletePO('${h.po}')">Delete</button>
                </td>
            `;
                        headerTableBody.appendChild(tr);
                    });
                });
            }
            // ================= STEP 2 GLOBAL =================
            let step2Data = [];       // menyimpan data Step 2 dari Firebase
            let uploadedImages = [];  // menampung image sebelum save

            const uploadInput = document.getElementById("upload-img");
            const previewDiv = document.getElementById("preview-img");

            // ================= IMAGE UPLOAD =================
            uploadInput.addEventListener("change", (e) => {
                const files = Array.from(e.target.files);

                if (uploadedImages.length + files.length > 10) {
                    alert("Maksimal 10 gambar per section!");
                    return;
                }

                files.forEach(file => {
                    const reader = new FileReader();
                    reader.onload = function (ev) {
                        uploadedImages.push(ev.target.result); // simpan base64
                        const img = document.createElement("img");
                        img.src = ev.target.result;
                        img.style.width = "80px";
                        img.style.height = "80px";
                        img.style.objectFit = "cover";
                        img.style.margin = "2px";
                        previewDiv.appendChild(img);
                    };
                    reader.readAsDataURL(file);
                });

                uploadInput.value = "";
            });

            // ======= Voice Input =======
            function initVoiceInput(textareaId, buttonId) {
                const btn = document.getElementById(buttonId);
                const textarea = document.getElementById(textareaId);

                const originalText = btn.textContent; // ✅ TAMBAHAN AMAN

                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                if (!SpeechRecognition) return alert("Browser ini tidak mendukung voice input");

                const recognition = new SpeechRecognition();
                recognition.lang = 'id-ID';
                recognition.interimResults = false;
                recognition.maxAlternatives = 1;

                btn.onclick = () => {
                    recognition.start();
                    btn.textContent = "🎤 Listening...";
                };

                recognition.onresult = (event) => {
                    const spokenText = event.results[0][0].transcript;

                    textarea.value += (textarea.value ? " " : "") + spokenText;

                    // SIMPAN DATASET DARI VOICE
                    if (!textarea.dataset.original) {
                        textarea.dataset.original = textarea.value;
                    }
                    textarea.dataset.current = textarea.value;
                    textarea.dataset.lang = 'id';

                    btn.textContent = originalText; // ✅ KEMBALIKAN
                };

                recognition.onerror = (e) => {
                    console.error("Voice error:", e.error);
                    btn.textContent = originalText; // ✅
                };

                recognition.onend = () => {
                    btn.textContent = originalText; // ✅
                };
            }
            // ======= SIMPAN INPUT MANUAL (FIX UTAMA ADA DI SINI) =======
            document.getElementById("inspectionReport").addEventListener("input", (e) => {
                // jika user mengetik → anggap teks BARU
                e.target.dataset.original = e.target.value;
                e.target.dataset.current = e.target.value;
                e.target.dataset.lang = 'id'; // <-- INI KUNCI PERBAIKAN
            });
            // ======= Translate Multi Bahasa (Dropdown) =======
            async function translateTextareaWithDropdown(textareaId, selectId) {
                const textarea = document.getElementById(textareaId);
                const select = document.getElementById(selectId);
                const toLang = select.value;

                // pastikan dataset selalu ada
                if (!textarea.dataset.current) textarea.dataset.current = textarea.value;
                if (!textarea.dataset.lang) textarea.dataset.lang = 'id';

                const fromLang = textarea.dataset.lang;
                const sourceText = textarea.dataset.current.trim();
                if (!sourceText) return;

                // jika target sama dengan source → kembalikan ke teks asli
                if (fromLang === toLang) return;

                try {
                    const res = await fetch(
                        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(sourceText)}&langpair=${fromLang}|${toLang}`
                    );
                    const data = await res.json();

                    if (data.responseData.translatedText) {
                        textarea.value = data.responseData.translatedText;
                        textarea.dataset.current = data.responseData.translatedText;
                        textarea.dataset.lang = toLang;
                        const section = document.getElementById("select-section").value;
                        if (section) {
                            if (!step2Data[section]) step2Data[section] = [];
                            step2Data[section].report = textarea.value;
                        }
                    }
                } catch (err) {
                    console.error("Translate error", err);
                }
            }
            // ======= Inisialisasi Voice =======
            initVoiceInput("inspectionReport", "voiceReport");

            // ======= Tombol Translate =======
            document.getElementById("translateReport").onclick = () => {
                translateTextareaWithDropdown("inspectionReport", "translateLangReport");
            };

            // ================= GO TO STEP 2 =================
            window.goToStep2 = function (headerPo, itemCode) {
                const header = headers.find(h => h.po === headerPo);
                if (!header) return alert("Data header tidak ditemukan!");
                const item = (header.items || []).find(i => i.item === itemCode);
                if (!item) return alert("Data item tidak ditemukan!");

                document.getElementById("step1").style.display = "none";
                document.getElementById("step2").style.display = "block";

                // Set Step 2 info
                document.getElementById("s2-vendor").textContent = header.vendor;
                document.getElementById("s2-po").textContent = header.po;
                document.getElementById("s2-item").textContent = item.item;
                document.getElementById("s2-desc").textContent = item.desc;
                document.getElementById("s2-qtypo").textContent = item.qty;
                document.getElementById("s2-aql").textContent = header.qtyAQL || hitungAQL(item.qty);
                document.getElementById("s2-inspector").textContent = header.inspector;
                document.getElementById("s2-date").textContent = header.date;

                // Reset Step 2
                document.getElementById("preview-img").innerHTML = "";
                document.getElementById("inspectionReport").value = "";
                document.getElementById("select-section").value = "";
                uploadedImages = [];
            };

            // ================= BACK TO STEP 1 =================
            document.getElementById("s2-back").addEventListener("click", () => {
                document.getElementById("step2").style.display = "none";
                document.getElementById("step1").style.display = "block";
            });

            // ================= SAVE STEP 2 =================
            document.getElementById("s2-save").addEventListener("click", async () => {
                const vendor = document.getElementById("s2-vendor").textContent;
                const po = document.getElementById("s2-po").textContent;
                const item = document.getElementById("s2-item").textContent;
                const desc = document.getElementById("s2-desc").textContent;
                const qtyPO = document.getElementById("s2-qtypo").textContent;
                const qtyAQL = document.getElementById("s2-aql").textContent;
                const inspector = document.getElementById("s2-inspector").textContent;
                const date = document.getElementById("s2-date").textContent;
                const section = document.getElementById("select-section").value;
                const report = document.getElementById("inspectionReport").value;

                if (!vendor || !po || !item || !section || !report) {
                    return alert("Semua field wajib diisi sebelum save Step 2!");
                }

                if (uploadedImages.length === 0) return alert("Minimal 1 gambar harus diupload!");

                // CEK DUPLIKAT SECTION
                const duplicate = step2Data.find(d => d.po === po && d.item === item && d.section === section);
                if (duplicate) return alert(`Section "${section}" untuk PO "${po}" dan Item "${item}" sudah ada!`);

                try {
                    const dataToSave = {vendor, po, item, desc, qtyPO, qtyAQL, inspector, date, section, report};

                    uploadedImages.forEach((img, idx) => {
                        if (idx < 10) dataToSave[`image${idx + 1}`] = img;
                    });

                    const docRef = await addDoc(collection(db, "step2"), dataToSave);
                    step2Data.push({id: docRef.id, ...dataToSave});

                    alert("Step 2 berhasil disimpan!");

                    // reset
                    document.getElementById("inspectionReport").value = "";
                    document.getElementById("select-section").value = "";
                    uploadedImages = [];
                    previewDiv.innerHTML = "";

                    renderStep2Table(); // render semua
                    updateStep2FilterPO(); // update dropdown PO

                } catch (err) {
                    console.error(err);
                    alert("Gagal save Step 2");
                }
            });

            // ================= DELETE STEP 2 =================
            window.deleteStep2 = async function (id) {
                try {
                    await deleteDoc(doc(db, "step2", id));
                    step2Data = step2Data.filter(d => d.id !== id);
                    renderStep2Table();
                    updateStep2FilterPO();
                    alert("Data Step 2 berhasil dihapus!");
                } catch (err) {
                    console.error(err);
                    alert("Gagal hapus Step 2");
                }
            };

            // ================= RENDER TABLE STEP 2 =================
            function renderStep2Table(data = step2Data) {
                const tbody = document.querySelector("#step2-result tbody");
                tbody.innerHTML = "";

                data.forEach(d => {
                    const tr = document.createElement("tr");
                    let imgCols = "";
                    for (let i = 1; i <= 10; i++) {
                        imgCols += `<td>${d[`image${i}`] ? `<img src="${d[`image${i}`]}" width="50">` : ""}</td>`;
                    }

                    tr.innerHTML = `
                    <td>${d.vendor}</td>
                    <td>${d.po}</td>
                    <td>${d.item}</td>
                    <td>${d.qtyPO}</td>
                    <td>${d.qtyAQL}</td>
                    <td>${d.section}</td>
                    <td>${d.report}</td>
                    ${imgCols}
                    <td><button onclick="deleteStep2('${d.id}')">Delete</button></td>
                    `;
                    tbody.appendChild(tr);
                });
            }

            // ================= UPDATE SELECT PO STEP 2 =================
            function updateStep2FilterPO() {
                const filterStep2PO = document.getElementById("filter-po");
                filterStep2PO.innerHTML = '<option value="">-- Select PO --</option>';

                const uniquePOs = [...new Set(step2Data.map(d => d.po))];
                uniquePOs.forEach(po => {
                    const opt = document.createElement("option");
                    opt.value = po;
                    opt.textContent = po;
                    filterStep2PO.appendChild(opt);
                });
            }

            // ================= FILTER TABEL BERDASARKAN PO =================
            document.getElementById("filter-po").addEventListener("change", (e) => {
                const selectedPO = e.target.value;

                if (!selectedPO) {
                    // Jika tidak ada PO yang dipilih, kosongkan tabel
                    renderStep2Table([]);
                } else {
                    // Tampilkan data yang sesuai PO yang dipilih
                    const filtered = step2Data.filter(d => d.po === selectedPO);
                    renderStep2Table(filtered);
                }
            });

            // ================= LOAD STEP 2 DARI FIREBASE =================
            async function loadStep2Data() {
                const snapshot = await getDocs(collection(db, "step2"));
                step2Data = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
                renderStep2Table();
                updateStep2FilterPO();
                updateInventory();
            }

            // ============= TABEL INVENTORY =================
            const inventoryVendor = document.getElementById("inventoryVendor");
            const inventoryPO = document.getElementById("inventoryPO");
            const inventoryTbody = document.querySelector("#inventoryTable tbody");
            const backToMenuBtnInventory = document.getElementById("backToMenuBtnInventory");

            // render Inventory table dari data Step 2
            function renderInventory(data = step2Data) {
                inventoryTbody.innerHTML = "";
                data.forEach(d => {
                    const tr = document.createElement("tr");
                    let imgCols = "";
                    for (let i = 1; i <= 10; i++) {
                        imgCols += `<td>${d[`image${i}`] ? `<img src="${d[`image${i}`]}" width="60">` : ""}</td>`;
                    }
                    tr.innerHTML = `
                        <td>${d.item}</td>
                        <td>${d.qtyPO}</td>
                        <td>${d.qtyAQL}</td>
                        <td>${d.section}</td>
                        <td>${d.report}</td>
                        ${imgCols}
                    `;
                    inventoryTbody.appendChild(tr);
                });
            }

            // update filter Vendor & PO di Inventory
            function updateInventoryFilter() {
                // vendor unik dari step2Data
                const vendors = [...new Set(step2Data.map(d => d.vendor))];
                inventoryVendor.innerHTML = `<option value="">-- Select Vendor --</option>`;
                vendors.forEach(v => {
                    inventoryVendor.insertAdjacentHTML("beforeend", `<option value="${v}">${v}</option>`);
                });

                // reset PO
                inventoryPO.innerHTML = `<option value="">-- Select PO --</option>`;
                inventoryPO.disabled = true;
            }

            // event change Vendor
            inventoryVendor.addEventListener("change", () => {
                const selectedVendor = inventoryVendor.value;
                if (!selectedVendor) {
                    inventoryPO.innerHTML = `<option value="">-- Select PO --</option>`;
                    inventoryPO.disabled = true;
                    renderInventory([]);
                } else {
                    const pos = [...new Set(step2Data.filter(d => d.vendor === selectedVendor).map(d => d.po))];
                    inventoryPO.innerHTML = `<option value="">-- Select PO --</option>`;
                    pos.forEach(po => {
                        inventoryPO.insertAdjacentHTML("beforeend", `<option value="${po}">${po}</option>`);
                    });
                    inventoryPO.disabled = false;

                    renderInventory(step2Data.filter(d => d.vendor === selectedVendor));
                }
            });

            // event change PO
            inventoryPO.addEventListener("change", () => {
                const selectedVendor = inventoryVendor.value;
                const selectedPO = inventoryPO.value;
                if (!selectedPO) {
                    renderInventory(step2Data.filter(d => d.vendor === selectedVendor));
                } else {
                    renderInventory(step2Data.filter(d => d.vendor === selectedVendor && d.po === selectedPO));
                }
            });

            // panggil setelah Step 2 data di-load
            function updateInventory() {
                updateInventoryFilter();
                renderInventory();
            }

            loadStep2Data();
            backToMenuBtnInventory.addEventListener("click", () => showSection("dashboard"));

            // ============= EXPORT PDF INVENTORY ==============
            document.getElementById("exportPdfBtn").addEventListener("click", async () => {
                const {jsPDF} = window.jspdf;
                const doc = new jsPDF('landscape', 'pt', 'a4');
                const pageWidth = doc.internal.pageSize.getWidth();
                const pageHeight = doc.internal.pageSize.getHeight();
                const margin = 20;

                const vendor = document.getElementById("inventoryVendor").value;
                const po = document.getElementById("inventoryPO").value;
                if (!vendor) return alert("Please select a Vendor first!");
                if (!po) return alert("Please select a PO first!");

                const header = headers.find(h => h.vendor === vendor && h.po === po);
                const inspector = header?.inspector || "-";
                const inspectDate = header?.date || "-";
                const printDate = new Date().toLocaleString('id-ID');

                const dataRows = step2Data.filter(d => d.vendor === vendor && d.po === po);
                if (dataRows.length === 0) return alert("There is no data for this Vendor & PO!");

                // HEADER
                doc.setFontSize(16);
                doc.text("Summary Report Data Inspection", pageWidth / 2, 30, {align: "center"});
                doc.setFontSize(10);
                doc.text(`Vendor: ${vendor}`, margin, 50);
                doc.text(`PO: ${po}`, margin + 250, 50);
                doc.text(`Inspection: ${inspector}`, margin + 500, 50);
                doc.text(`Inspect Date: ${inspectDate}`, margin, 65);
                doc.text(`Print Date: ${printDate}`, margin + 250, 65);

                // COLUMN HEADERS
                const columns = [
                    "Item", "Qty PO", "Qty Inspect", "Section", "Inspection Report",
                    "Image 1", "Image 2", "Image 3", "Image 4", "Image 5",
                    "Image 6", "Image 7", "Image 8", "Image 9", "Image 10"
                ];

                // MAP DATA FOR TABLE BODY (WITHOUT BASE64 STRINGS, JUST EMPTY FOR IMAGES)
                const bodyData = dataRows.map(d => {
                    return [
                        d.item, d.qtyPO, d.qtyAQL, d.section, d.report,
                        "", "", "", "", "",
                        "", "", "", "", ""
                    ];
                });

                // SET Y START after header
                const startY = 90;

                // KEEP TRACK OF PAGES FOR SIGNATURE
                let finalY = startY;

                doc.autoTable({
                    startY: 90,
                    head: [columns],
                    body: bodyData,
                    styles: {fontSize: 8, cellPadding: 4, valign: 'middle', minCellHeight: 40},
                    headStyles: {fillColor: [0, 102, 204], textColor: 255, halign: 'center'},
                    alternateRowStyles: {fillColor: [240, 240, 240]},
                    columnStyles: {
                        0: {cellWidth: 60},
                        1: {cellWidth: 40, halign: 'center'},
                        2: {cellWidth: 50, halign: 'center'},
                        3: {cellWidth: 80},
                        4: {cellWidth: 150},
                        5: {cellWidth: 40, halign: 'center'},
                        6: {cellWidth: 40, halign: 'center'},
                        7: {cellWidth: 40, halign: 'center'},
                        8: {cellWidth: 40, halign: 'center'},
                        9: {cellWidth: 40, halign: 'center'},
                        10: {cellWidth: 40, halign: 'center'},
                        11: {cellWidth: 40, halign: 'center'},
                        12: {cellWidth: 40, halign: 'center'},
                        13: {cellWidth: 40, halign: 'center'},
                        14: {cellWidth: 40, halign: 'center'},
                    },
                    didDrawCell: function (data) {
                        // Hanya untuk baris body
                        if (data.row.section === 'body') {
                            const colIndex = data.column.index;
                            if (colIndex >= 5 && colIndex <= 14) {
                                const rowIndex = data.row.index;
                                const row = dataRows[rowIndex];
                                const imgKey = `image${colIndex - 4}`; // image1..image10
                                const imgData = row[imgKey];
                                if (imgData) {
                                    const dim = 30;
                                    const x = data.cell.x + (data.cell.width - dim) / 2;
                                    const y = data.cell.y + (data.cell.height - dim) / 2;
                                    try {
                                        doc.addImage(imgData, 'JPEG', x, y, dim, dim);
                                    } catch (e) {
                                        // Jika gagal, tampilkan tanda centang kecil
                                        doc.setFontSize(16);
                                        doc.text("✔", x + dim / 4, y + dim * 0.75);
                                        doc.setFontSize(8);
                                    }
                                }
                            }
                        }
                    },
                    didDrawPage: (data) => {
                        finalY = data.cursor.y;
                    },
                    margin: {top: startY, left: margin, right: margin}
                });

                // HITUNG POSISI UNTUK SIGNATURE
                const sigWidth = 150;
                const sigHeight = 60;
                const sigGap = 10;

                // Tentukan posisi Y
                let sigY = finalY + 20;
                if (sigY + sigHeight + 20 > pageHeight) {
                    sigY = pageHeight - sigHeight - 20;
                }

                // TOTAL LEBAR SIGNATURE
                const totalSigWidth = (sigWidth * 3) + (sigGap * 2);

                // CENTER DI HALAMAN
                const sigXStart = pageWidth - margin - totalSigWidth;


                // GAMBAR KOTAK
                for (let i = 0; i < 3; i++) {
                    const x = sigXStart + i * (sigWidth + sigGap);
                    doc.rect(x, sigY, sigWidth, sigHeight);
                }

                // TEXT
                doc.setFontSize(10);
                doc.text(`Inspector: ${inspector}`, sigXStart + 5, sigY + 35);
                doc.text("QC Vendor: _________", sigXStart + sigWidth + sigGap + 5, sigY + 35);
                doc.text("Approved: _________", sigXStart + (sigWidth + sigGap) * 2 + 5, sigY + 35);

                // SIMPAN PDF
                doc.save(`Summary_Report_Data_Inspection_${po}.pdf`);
            });

            // FUNCTION ZOOM IMAGE
            function setupImageZoom(tableSelector) {
                const table = document.querySelector(tableSelector);
                if (!table) return;

                table.addEventListener('click', function (e) {
                    if (e.target.tagName === 'IMG') {
                        const modal = document.getElementById('imageModal');
                        const modalImg = document.getElementById('modalImage');
                        modal.style.display = 'block';
                        modalImg.src = e.target.src;
                    }
                });
            }

            // CLOSE MODAL
            document.querySelector('.img-modal-close').onclick = function () {
                document.getElementById('imageModal').style.display = "none";
            }
            document.getElementById('imageModal').onclick = function (e) {
                if (e.target === this) {
                    this.style.display = "none";
                }
            }

            // SETUP FOR ALL TABLES
            setupImageZoom('.result-table'); // Header
            setupImageZoom('#step2-result'); // Step 2
            setupImageZoom('#inventoryTable'); // Inventory


            // ===============================
            // ELEMENT PURCHASE ORDER
            // ===============================
            const kodeSelector1 = document.getElementById("kodeSelector1");
            const searchInput = document.getElementById("searchInput");
            const poTableBody = document.getElementById("poTableBody");
            const backToMenuBtnPurchaseOrder =
                document.getElementById("backToMenuBtnPurchaseOrder");

            // ===============================
            // GENERATE SELECT PO DARI MASTER FIREBASE
            // ===============================
            function generatePOSelect() {
                kodeSelector1.innerHTML =
                    '<option value="">-- Select PO --</option>';

                const poList = Object.keys(dataByKode).sort(
                    (a, b) => a.localeCompare(b, undefined, {numeric: true})
                );

                poList.forEach(po => {
                    const option = document.createElement("option");
                    option.value = po;
                    option.textContent = po;
                    kodeSelector1.appendChild(option);
                });

                console.log(
                    `Select PO berhasil dimuat: ${poList.length} PO`
                );
            }

            // ===============================
            // DISPLAY DATA PO
            // ===============================
            function tampilkanData(kode = "") {
                poTableBody.innerHTML = "";

                const selectedPO = kode || kodeSelector1.value;
                if (!selectedPO) return;

                const poData = dataByKode[selectedPO];
                if (!poData) {
                    console.warn("Detail PO tidak ditemukan:", selectedPO);
                    return;
                }

                const items = Array.isArray(poData.items)
                    ? poData.items
                    : [];

                items.forEach(item => {
                    const tr = document.createElement("tr");

                    const values = [
                        poData.Vendor || "",
                        selectedPO,
                        item.item || "",
                        item.qty ?? "",
                        item.desc || "",
                        poData.ecrd || ""
                    ];

                    values.forEach(value => {
                        const td = document.createElement("td");
                        td.textContent = value;
                        tr.appendChild(td);
                    });

                    const imageCell = document.createElement("td");
                    if (item.image) {
                        const img = document.createElement("img");
                        img.src = item.image;
                        img.style.width = "50px";
                        img.style.cursor = "pointer";
                        imageCell.appendChild(img);
                    }
                    tr.appendChild(imageCell);

                    poTableBody.appendChild(tr);
                });
            }

            // ===============================
            // EVENT SELECT PO
            // ===============================
            kodeSelector1.addEventListener("change", () => {
                searchInput.value = "";
                tampilkanData();
            });

            // ===============================
            // SEARCH MANUAL PO
            // ===============================
            function cariManual() {
                const input = searchInput.value.trim().toLowerCase();

                if (!input) {
                    kodeSelector1.value = "";
                    poTableBody.innerHTML = "";
                    return;
                }

                const poList = Object.keys(dataByKode);

                // Cari PO yang cocok secara tepat terlebih dahulu
                let foundPO = poList.find(
                    po => po.toLowerCase() === input
                );

                // Jika tidak ada, cari PO yang mengandung teks input
                if (!foundPO) {
                    foundPO = poList.find(
                        po => po.toLowerCase().includes(input)
                    );
                }

                if (!foundPO) {
                    kodeSelector1.value = "";
                    poTableBody.innerHTML = "";
                    console.log("PO tidak ditemukan:", input);
                    return;
                }

                kodeSelector1.value = foundPO;
                tampilkanData(foundPO);
            }

            // ===============================
            // NEXT PO
            // ===============================
            function nextPO() {
                const index = kodeSelector1.selectedIndex;

                if (index < kodeSelector1.options.length - 1) {
                    kodeSelector1.selectedIndex = index + 1;
                    searchInput.value = "";
                    tampilkanData();
                }
            }

            // ===============================
            // PREVIOUS PO
            // ===============================
            function previousPO() {
                const index = kodeSelector1.selectedIndex;

                if (index > 1) {
                    kodeSelector1.selectedIndex = index - 1;
                    searchInput.value = "";
                    tampilkanData();
                }
            }

            // ===============================
            // RESET PO MENU
            // ===============================
            function resetPOMenu() {
                kodeSelector1.value = "";
                searchInput.value = "";
                poTableBody.innerHTML = "";
            }

            // ===============================
            // INIT
            // ===============================
            generatePOSelect();

            backToMenuBtnPurchaseOrder.addEventListener(
                "click",
                () => {
                    resetPOMenu();
                    showSection("dashboard");
                }
            );

            // ===============================
            // IMAGE ZOOM MODAL
            // ===============================
            const imageModal = document.getElementById("imageModal");
            const modalImage = document.getElementById("modalImage");
            const modalClose = document.querySelector(".img-modal-close");

            // Klik gambar pada tabel Purchase Order
            document.getElementById("poTableBody").addEventListener("click", function (e) {
                const img = e.target.closest("img");

                if (!img) return;

                modalImage.src = img.src;
                imageModal.style.display = "block";
            });

            // Tutup modal dengan tombol X
            modalClose.addEventListener("click", function () {
                imageModal.style.display = "none";
                modalImage.src = "";
            });

            // Tutup modal jika klik area gelap
            imageModal.addEventListener("click", function (e) {
                if (e.target === imageModal) {
                    imageModal.style.display = "none";
                    modalImage.src = "";
                }
            });

            // Tutup dengan tombol Escape
            document.addEventListener("keydown", function (e) {
                if (e.key === "Escape") {
                    imageModal.style.display = "none";
                    modalImage.src = "";
                }
            });
            // Klik gambar yang diperbesar untuk menutup modal
            modalImage.addEventListener("click", function () {
                imageModal.style.display = "none";
                modalImage.src = "";
            });

            // ===============================
            // GLOBAL
            // ===============================
            window.nextPO = nextPO;
            window.previousPO = previousPO;
            window.cariManual = cariManual;
            window.resetPOMenu = resetPOMenu;

            // ===============================
            // AQL TABLE DATA
            // ===============================
            window.showAqlTableDetail = function () {
                const select = document.getElementById("aqlSelect").value;
                const content = document.getElementById("AqlTabelContent");
                const section = document.getElementById("aqlSection");

                content.innerHTML = ""; // reset dulu

                if (select === "aqlTable") {
                    section.style.display = 'block';
                    window.renderAQLTable();
                }
            };

            window.renderAQLTable = function () {
                const content = document.getElementById("AqlTabelContent");

                const aqlData = [
                    {inspect: "2 – 8", sizeCode: "A", aql: 2, maxReject: 0},
                    {inspect: "9 – 15", sizeCode: "B", aql: 3, maxReject: 0},
                    {inspect: "16 – 25", sizeCode: "C", aql: 5, maxReject: 0},
                    {inspect: "26 – 50", sizeCode: "D", aql: 8, maxReject: 0},
                    {inspect: "51 – 90", sizeCode: "E", aql: 13, maxReject: 0},
                    {inspect: "91 – 150", sizeCode: "F", aql: 20, maxReject: 1},
                    {inspect: "151 – 280", sizeCode: "G", aql: 32, maxReject: 2},
                    {inspect: "281 – 500", sizeCode: "H", aql: 50, maxReject: 3},
                    {inspect: "501 – 1200", sizeCode: "J", aql: 80, maxReject: 5},
                    {inspect: "1201 – 3200", sizeCode: "K", aql: 125, maxReject: 7},
                    {inspect: "3201 – 10000", sizeCode: "L", aql: 200, maxReject: 10},
                    {inspect: "10001 – 35000", sizeCode: "M", aql: 315, maxReject: 14},
                    {inspect: "35001 – 150000", sizeCode: "N", aql: 500, maxReject: 21},
                    {inspect: "150001 – 500000", sizeCode: "P", aql: 800, maxReject: 21},
                    {inspect: "500001 and over", sizeCode: "Q", aql: 1250, maxReject: 21}
                ];

                let html = `
        <div class="aql-title">📊 AQL (Acceptable Quality Level)</div>
        <table class="aql-table">
            <thead>
                <tr>
                    <th>Qty Lot or Batch Size</th>
                    <th>Size Code</th>
                    <th>Qty Sample Inspection</th>
                    <th>Qty Max Rejected</th>
                </tr>
            </thead>
            <tbody>
    `;

                aqlData.forEach(row => {
                    html += `
            <tr>
                <td>${row.inspect}</td>
                <td>${row.sizeCode}</td>
                <td>${row.aql}</td>
                <td>${row.maxReject}</td>
            </tr>
        `;
                });

                html += `</tbody></table>`;
                content.innerHTML = html;
            };
            // Reset jika keluar menu
            function resetAqlTable() {
                document.getElementById("aqlSelect").value = "";
                document.getElementById("AqlTabelContent").innerHTML = "";
            }

            // ===============================
            // GUIDE INSPECTION DATA
            // ===============================
            window.showGuideDetail = function () {
                const select = document.getElementById("guideSelect").value;
                const content = document.getElementById("guideContent");

                // reset konten dulu
                content.innerHTML = "";

                // jika ada value yang dipilih, tampilkan isi panduan
                if (select && guideTexts[select]) {
                    content.innerHTML = guideTexts[select];
                }
            };

            // =========================
            // DASHBOARD DATA - KOLEKSI TERPISAH
            // Sumber: Firestore collection "dashboardData"
            // Struktur per dokumen: year, month, sales, qtySales, totalPO,
            // inspectionValueUSD, approvedInspection
            // =========================
            const dashboardMonthNames = [
                'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
            ];
            const dashboardUsdFormatter = new Intl.NumberFormat('en-US', {
                style: 'currency', currency: 'USD', minimumFractionDigits: 0
            });
            const dashboardNumberFormatter = new Intl.NumberFormat('en-US');
            let salesBarChart = null;
            let salesPieChart = null;
            let salesLineChart = null;
            let poBarChart = null;
            let dashboardLoadInProgress = false;

            function dashboardNumber(value) {
                if (value === null || value === undefined || value === '') return 0;
                const n = Number(value);
                return Number.isFinite(n) ? n : 0;
            }

            function dashboardRowsFromSnapshot(snapshot) {
                return snapshot.docs.map(docSnap => {
                    const d = docSnap.data() || {};
                    return {
                        year: Math.trunc(dashboardNumber(d.year)),
                        month: Math.trunc(dashboardNumber(d.month)),
                        sales: dashboardNumber(d.sales),
                        qtySales: dashboardNumber(d.qtySales),
                        totalPO: dashboardNumber(d.totalPO),
                        inspectionValueUSD: dashboardNumber(d.inspectionValueUSD),
                        approvedInspection: dashboardNumber(d.approvedInspection)
                    };
                    // month = 0 diperbolehkan untuk total historis tahunan (mis. 2024/2025).
                    // Bulan 1–12 tetap digunakan untuk data bulanan tahun berjalan.
                }).filter(d => d.year >= 2000 && d.month >= 0 && d.month <= 12);
            }

            async function loadDashboardData() {
                if (dashboardLoadInProgress) return;
                dashboardLoadInProgress = true;
                const statusEl = document.getElementById('dashboardDataStatus');
                if (statusEl) statusEl.textContent = 'Memuat data Dashboard dari Firebase...';

                try {
                    const snapshot = await getDocs(collection(db, 'dashboardData'));
                    const rows = dashboardRowsFromSnapshot(snapshot);
                    loadKPI(rows);
                    renderDashboardCharts(rows);

                    if (statusEl) {
                        if (rows.length === 0) {
                            statusEl.textContent = 'Belum ada data Dashboard. Silakan unggah data melalui menu khusus Dashboard setelah menu upload disiapkan.';
                        } else {
                            const years = [...new Set(rows.map(r => r.year))].sort((a, b) => a - b);
                            statusEl.textContent = `Data Dashboard berhasil dimuat: ${rows.length} baris, tahun ${years.join(', ')}.`;
                        }
                    }
                } catch (error) {
                    console.error('Gagal memuat dashboardData dari Firestore:', error);
                    if (statusEl) statusEl.textContent = 'Data Dashboard gagal dimuat. Periksa koneksi dan Firestore Rules untuk koleksi dashboardData.';
                    loadKPI([]);
                    renderDashboardCharts([]);
                } finally {
                    dashboardLoadInProgress = false;
                }
            }

            // Upload Excel dashboard khusus admin. Data lama pada dashboardData akan diganti.
            const uploadDashboardExcelBtn = document.getElementById("uploadDashboardExcelBtn");
            if (uploadDashboardExcelBtn) {
                uploadDashboardExcelBtn.addEventListener("click", async () => {
                    const statusEl = document.getElementById("dashboardUploadStatus");
                    const fileInput = document.getElementById("dashboardExcelFile");
                    const file = fileInput?.files?.[0];
                    if (!auth.currentUser || !isDashboardAdmin) {
                        if (statusEl) statusEl.textContent = "Akses ditolak. Login dengan akun yang memiliki role admin.";
                        return;
                    }
                    if (!file) {
                        if (statusEl) statusEl.textContent = "Pilih file Excel terlebih dahulu.";
                        return;
                    }
                    if (!window.XLSX) {
                        if (statusEl) statusEl.textContent = "Library pembaca Excel belum berhasil dimuat. Muat ulang halaman.";
                        return;
                    }
                    uploadDashboardExcelBtn.disabled = true;
                    if (statusEl) statusEl.textContent = "Memeriksa file Excel...";
                    try {
                        const buffer = await file.arrayBuffer();
                        const workbook = window.XLSX.read(buffer, {type: "array", cellDates: false});
                        const sheet = workbook.Sheets["DashboardData"];
                        if (!sheet) throw new Error('Sheet "DashboardData" tidak ditemukan. Gunakan template Excel Dashboard.');
                        const rawRows = window.XLSX.utils.sheet_to_json(sheet, {defval: null, raw: true});
                        const required = ["year", "month", "sales", "qtySales", "totalPO", "inspectionValueUSD", "approvedInspection"];
                        if (!rawRows.length) throw new Error("Sheet DashboardData belum berisi baris data.");
                        const headers = Object.keys(rawRows[0]);
                        const missing = required.filter(key => !headers.includes(key));
                        if (missing.length) throw new Error("Kolom wajib tidak ditemukan: " + missing.join(", "));
                        const parsed = rawRows.map((row, index) => {
                            const n = key => {
                                const value = row[key];
                                if (value === null || value === undefined || value === "") return 0;
                                const number = Number(value);
                                if (!Number.isFinite(number)) throw new Error(`Baris ${index + 2}: kolom ${key} harus berisi angka.`);
                                return number;
                            };
                            const year = n("year");
                            const month = n("month");
                            if (!Number.isInteger(year) || year < 2000 || year > 2100) throw new Error(`Baris ${index + 2}: tahun harus berupa angka 2000–2100.`);
                            if (!Number.isInteger(month) || month < 0 || month > 12) throw new Error(`Baris ${index + 2}: bulan harus angka 0–12. Gunakan 0 untuk total historis tahunan.`);
                            return {year, month, sales: n("sales"), qtySales: n("qtySales"), totalPO: n("totalPO"), inspectionValueUSD: n("inspectionValueUSD"), approvedInspection: n("approvedInspection")};
                        });
                        const keys = parsed.map(r => `${r.year}-${String(r.month).padStart(2, "0")}`);
                        if (new Set(keys).size !== keys.length) throw new Error("Ada tahun dan bulan yang duplikat. Pastikan hanya satu baris untuk setiap bulan dalam setiap tahun.");
                        if (!confirm(`Upload ${parsed.length} baris dan mengganti seluruh data dashboardData yang ada? Data PO dan Inspection tidak akan diubah.`)) {
                            if (statusEl) statusEl.textContent = "Upload dibatalkan.";
                            return;
                        }
                        if (statusEl) statusEl.textContent = "Mengganti data Dashboard di Firebase...";
                        const existing = await getDocs(collection(db, "dashboardData"));
                        const operations = [];
                        existing.docs.forEach(d => operations.push({type: "delete", ref: d.ref}));
                        parsed.forEach(row => {
                            const id = `${row.year}-${String(row.month).padStart(2, "0")}`;
                            operations.push({type: "set", ref: doc(db, "dashboardData", id), data: row});
                        });
                        // Batas aman batch Firestore; proses per 400 operasi.
                        for (let i = 0; i < operations.length; i += 400) {
                            const batch = writeBatch(db);
                            operations.slice(i, i + 400).forEach(op => {
                                if (op.type === "delete") batch.delete(op.ref);
                                else batch.set(op.ref, op.data);
                            });
                            await batch.commit();
                        }
                        if (statusEl) statusEl.textContent = `Berhasil mengunggah ${parsed.length} baris data Dashboard.`;
                        await loadDashboardData();
                    } catch (error) {
                        console.error("Upload data Dashboard gagal:", error);
                        if (statusEl) statusEl.textContent = "Upload gagal: " + (error?.message || "periksa koneksi dan Firestore Rules.");
                    } finally {
                        uploadDashboardExcelBtn.disabled = false;
                    }
                });
            }

            function loadKPI(rows) {
                const currentYear = new Date().getFullYear();
                const yearRows = rows.filter(r => r.year === currentYear);
                const sum = key => yearRows.reduce((total, row) => total + dashboardNumber(row[key]), 0);

                document.getElementById('kpiSales').textContent = dashboardUsdFormatter.format(sum('sales'));
                document.getElementById('kpiQtySales').textContent = dashboardNumberFormatter.format(sum('qtySales'));
                document.getElementById('kpiInspection').textContent = dashboardUsdFormatter.format(sum('inspectionValueUSD'));
                document.getElementById('kpiApproved').textContent = dashboardNumberFormatter.format(sum('approvedInspection'));
            }

            function destroyDashboardCharts() {
                [salesBarChart, salesPieChart, salesLineChart, poBarChart, window.salesBarChartInstance]
                    .forEach(chart => {if (chart && typeof chart.destroy === 'function') chart.destroy();});
                salesBarChart = salesPieChart = salesLineChart = poBarChart = null;
                window.salesBarChartInstance = null;
            }

            function renderDashboardCharts(rows) {
                const salesCanvas = document.getElementById('salesBarChart');
                const pieCanvas = document.getElementById('salesPieChart');
                const lineCanvas = document.getElementById('salesLineChart');
                const poCanvas = document.getElementById('poBarChart');
                if (!salesCanvas || !pieCanvas || !lineCanvas || !poCanvas) return;

                destroyDashboardCharts();
                const currentYear = new Date().getFullYear();

                // Semua tahun, termasuk data historis, dibaca dari Firestore.
                // Baris dengan month = 0 dipakai untuk total historis tahunan.
                const annualTotals = new Map();
                rows.forEach(row => {
                    const year = Number(row.year);
                    annualTotals.set(year, (annualTotals.get(year) || 0) + dashboardNumber(row.sales));
                });
                const salesPerYear = Array.from(annualTotals, ([year, total]) => ({year, total}))
                    .sort((a, b) => a.year - b.year);

                const currentYearRows = rows.filter(r => r.year === currentYear);
                const monthRows = Array.from({length: 12}, (_, i) => {
                    const month = i + 1;
                    const matches = currentYearRows.filter(r => r.month === month);
                    return {
                        month,
                        sales: matches.reduce((sum, r) => sum + r.sales, 0),
                        qtySales: matches.reduce((sum, r) => sum + r.qtySales, 0),
                        totalPO: matches.reduce((sum, r) => sum + r.totalPO, 0)
                    };
                });

                const commonCurrencyTicks = {callback: value => dashboardUsdFormatter.format(value)};

                salesBarChart = new Chart(salesCanvas.getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: salesPerYear.map(d => d.year),
                        datasets: [{
                            label: 'Total Sales', data: salesPerYear.map(d => d.total),
                            backgroundColor: 'rgba(37, 99, 235, 0.7)',
                            borderColor: 'rgba(37, 99, 235, 1)', borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {display: false},
                            tooltip: {callbacks: {label: context => dashboardUsdFormatter.format(context.raw)}}
                        },
                        scales: {y: {beginAtZero: true, ticks: commonCurrencyTicks}}
                    }
                });
                window.salesBarChartInstance = salesBarChart;

                salesPieChart = new Chart(pieCanvas.getContext('2d'), {
                    type: 'pie',
                    data: {
                        labels: dashboardMonthNames,
                        datasets: [{
                            label: 'Sales', data: monthRows.map(r => r.sales),
                            backgroundColor: ['#2563eb', '#10b981', '#facc15', '#f97316', '#8b5cf6', '#ec4899',
                                '#14b8a6', '#6366f1', '#a3e635', '#fb7185', '#0ea5e9', '#c084fc']
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {tooltip: {callbacks: {label: context => `${context.label}: ${dashboardUsdFormatter.format(context.raw)}`}}}
                    }
                });

                const now = new Date();
                const currentMonth = now.getMonth() + 1;
                const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
                const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;
                const getSales = (year, month) => rows
                    .filter(r => r.year === year && r.month === month)
                    .reduce((sum, r) => sum + r.sales, 0);
                salesLineChart = new Chart(lineCanvas.getContext('2d'), {
                    type: 'line',
                    data: {
                        labels: [`${dashboardMonthNames[previousMonth - 1]} ${previousYear}`, `${dashboardMonthNames[currentMonth - 1]} ${currentYear}`],
                        datasets: [{
                            label: 'Sales', data: [getSales(previousYear, previousMonth), getSales(currentYear, currentMonth)],
                            borderColor: '#2563eb', backgroundColor: 'rgba(37,99,235,0.2)', fill: true, tension: 0.3
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {tooltip: {callbacks: {label: context => `Sales: ${dashboardUsdFormatter.format(context.raw)}`}}},
                        scales: {y: {ticks: commonCurrencyTicks}}
                    }
                });

                poBarChart = new Chart(poCanvas.getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: dashboardMonthNames,
                        datasets: [{label: 'PO Count', data: monthRows.map(r => r.totalPO), backgroundColor: '#10b981'}]
                    },
                    options: {
                        responsive: true,
                        plugins: {tooltip: {callbacks: {label: context => `PO: ${dashboardNumberFormatter.format(context.raw)}`}}},
                        scales: {y: {beginAtZero: true, ticks: {callback: value => dashboardNumberFormatter.format(value)}}}
                    }
                });
            }

            // ===============================
            // LOGIN VERLAY 
            // ===============================
            function showWelcomeOverlay(user) {

                const overlay = document.getElementById("welcomeOverlay");
                const welcomeText = document.getElementById("welcomeText");

                const username = user.displayName
                    || user.email.split("@")[0];

                welcomeText.innerText = "Hello, " + username + " 👋";

                overlay.style.display = "flex";

                // Hilang otomatis setelah 3 detik
                setTimeout(() => {
                    overlay.style.display = "none";
                }, 3000);
            }
            // ===============================
            // HAK AKSES INPUT DATA
            // ===============================
            const allowedInputUsers = [
                "admin", "gumilang", "nono"
            ];
            // ===============================
            // LOGIN & LOGUT DATA
            // ===============================
            const IDLE_LIMIT = 30 * 60; // 30 menit dalam detik
            let idleTime = 0;

            function resetIdleTimer() {idleTime = 0;}

            function autoLogout() {
                signOut(auth).then(() => {
                    alert("Anda telah logout karena tidak aktif selama 30 menit!");
                    document.getElementById("dashboardPage").style.display = "none";
                    document.getElementById("loginPage").style.display = "flex";
                });
            }

            // Set interval hitung idle
            setInterval(() => {
                if (auth.currentUser) {
                    idleTime++;
                    if (idleTime >= IDLE_LIMIT) autoLogout();
                }
            }, 1000);

            // Reset timer saat aktivitas user
            ["mousemove", "keydown", "scroll", "click"].forEach(event =>
                document.addEventListener(event, resetIdleTimer, true)
            );

            // Firebase login/logout
            window.login = () => {
                const email = document.getElementById("email").value.trim();
                const password = document.getElementById("password").value.trim();
                if (!email || !password) return alert("Email dan password wajib diisi");

                signInWithEmailAndPassword(auth, email, password)
                    .then(() => {
                        document.getElementById("loginPage").style.display = "none";
                        document.getElementById("dashboardPage").style.display = "flex";
                        showSection("dashboard");
                    })
                    .catch(err => alert(err.message));
            };

            window.logout = () => signOut(auth).then(() => location.reload());

            // ===============================
            // SHOW USER ID IN DASHBOARD
            // ===============================
            onAuthStateChanged(auth, user => {
                if (user) {
                    // Periksa role terpisah untuk menentukan akses upload Dashboard.
                    refreshDashboardAdminAccess(user);
                    // Update User ID
                    const username = (user.email || user.uid).split("@")[0];
                    document.getElementById("user-id-display").innerText = "User ID : " + username;

                    document.getElementById("loginPage").style.display = "none";
                    document.getElementById("dashboardPage").style.display = "flex";
                    showSection("dashboard");

                    // ✅ Tampilkan welcome overlay HANYA saat login baru
                    if (!sessionStorage.getItem("welcomeShown")) {
                        showWelcomeOverlay(user);
                        sessionStorage.setItem("welcomeShown", "true");
                    }

                } else {
                    isDashboardAdmin = false;
                    const uploadButton = document.getElementById("dashboardUploadTabButton");
                    if (uploadButton) uploadButton.style.display = "none";
                    document.getElementById("loginPage").style.display = "flex";
                    document.getElementById("dashboardPage").style.display = "none";

                    // Reset User ID
                    document.getElementById("user-id-display").innerText = "User ID : -";

                    // Reset overlay flag
                    sessionStorage.removeItem("welcomeShown");
                }
            });
