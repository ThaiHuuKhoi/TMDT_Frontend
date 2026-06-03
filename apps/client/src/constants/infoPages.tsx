// File: constants/infoPages.tsx
import type { DynamicConfig } from "@/features/info-pages/config";

export const INFO_PAGES = [
    {
        category: "Chăm sóc khách hàng",
        links: [
            {
                title: "Trung tâm trợ giúp",
                slug: "trung-tam-tro-giup",
                content: ({ hotline, email }: DynamicConfig) => (
                    <>
                        <h2>Trung Tâm Trợ Giúp KCG Shop</h2>
                        <p>Chào mừng bạn đến với Trung tâm trợ giúp của KCG Shop! KCG Shop luôn nỗ lực mang đến trải nghiệm mua sắm tiện lợi và an tâm nhất. Nếu bạn gặp bất kỳ khó khăn nào, đội ngũ Chăm sóc khách hàng (CSKH) của chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ.</p>

                        <h3>1. Kênh liên hệ hỗ trợ</h3>
                        <ul>
                            <li><strong>Hotline CSKH:</strong> {hotline} (Miễn phí cước gọi)</li>
                            <li><strong>Email:</strong> {email}</li>
                            <li><strong>Thời gian hoạt động:</strong> 08:00 - 22:00 tất cả các ngày trong tuần (Bao gồm cả Lễ/Tết).</li>
                        </ul>

                        <h3>2. Các câu hỏi thường gặp (FAQ)</h3>
                        <h4>Làm sao để kiểm tra tình trạng đơn hàng?</h4>
                        <p>Bạn có thể đăng nhập vào tài khoản, chọn mục "Đơn hàng của tôi" để theo dõi hành trình đơn hàng chi tiết. Hoặc liên hệ qua Hotline và cung cấp mã đơn hàng cho nhân viên CSKH.</p>

                        <h4>Tôi có thể thay đổi địa chỉ nhận hàng sau khi đặt không?</h4>
                        <p>Nếu đơn hàng ở trạng thái "Chờ xác nhận", bạn có thể tự hủy và đặt lại. Nếu đơn hàng đã chuyển sang trạng thái "Đang giao", vui lòng gọi ngay Hotline {hotline} để nhân viên hỗ trợ chuyển hướng giao hàng.</p>

                        <h4>Nếu tôi nhận hàng bị thiếu hoặc sai sản phẩm thì phải làm sao?</h4>
                        <p>Xin vui lòng chụp ảnh/quay video lại kiện hàng lúc nhận và liên hệ ngay với bộ phận CSKH trong vòng 24 giờ. KCG Shop sẽ xử lý giao bù hoặc hoàn tiền ngay lập tức.</p>
                    </>
                ),
            },
            {
                title: "Hướng dẫn mua hàng",
                slug: "huong-dan-mua-hang",
                content: (
                    <>
                        <h2>Hướng Dẫn Mua Hàng Tại KCG Shop</h2>
                        <p>Mua sắm thực phẩm và đồ gia dụng tại KCG Shop chưa bao giờ dễ dàng đến thế! Chỉ với vài thao tác đơn giản, hàng hóa sẽ được giao đến tận cửa nhà bạn.</p>

                        <h3>Bước 1: Tìm kiếm sản phẩm</h3>
                        <p>Bạn có thể tìm sản phẩm theo 2 cách:</p>
                        <ul>
                            <li>Gõ tên sản phẩm vào <strong>Thanh tìm kiếm</strong> ở đầu trang (Ví dụ: "Sữa tươi", "Nước mắm").</li>
                            <li>Tìm theo <strong>Danh mục sản phẩm</strong> (Bách hóa, Mẹ & Bé, Đồ gia dụng...).</li>
                        </ul>

                        <h3>Bước 2: Chọn sản phẩm và Thêm vào giỏ hàng</h3>
                        <p>Khi tìm được sản phẩm ưng ý, bạn hãy chọn quy cách đóng gói (Thùng/Lốc/Gói), chọn số lượng và bấm <strong>"Thêm vào giỏ hàng"</strong>.</p>

                        <h3>Bước 3: Kiểm tra giỏ hàng và nhập Mã giảm giá</h3>
                        <p>Bấm vào biểu tượng Giỏ hàng ở góc phải màn hình. Tại đây, bạn có thể điều chỉnh lại số lượng hoặc xóa bớt sản phẩm. Đừng quên nhập <strong>Mã giảm giá (Coupon)</strong> nếu có để được hưởng ưu đãi nhé.</p>

                        <h3>Bước 4: Điền thông tin giao hàng & Thanh toán</h3>
                        <ul>
                            <li>Điền đầy đủ Tên, Số điện thoại và Địa chỉ nhận hàng chi tiết.</li>
                            <li>Chọn hình thức thanh toán phù hợp: Thanh toán khi nhận hàng (COD), thanh toán qua VNPAY, hoặc Thẻ tín dụng/Ghi nợ (Visa/Mastercard).</li>
                        </ul>

                        <h3>Bước 5: Xác nhận đơn hàng</h3>
                        <p>Sau khi kiểm tra lại toàn bộ thông tin, bấm <strong>"Tiến hành đặt hàng"</strong>. Hệ thống sẽ gửi email/SMS thông báo xác nhận đơn hàng thành công kèm mã vận đơn để bạn theo dõi.</p>
                    </>
                ),
            },
            {
                title: "Chính sách vận chuyển",
                slug: "chinh-sach-van-chuyen",
                content: ({ shippingFee, hotline }: DynamicConfig) => {
                    const fee = shippingFee.toLocaleString("vi-VN");
                    return (
                        <>
                            <h2>Chính Sách Vận Chuyển & Giao Nhận</h2>
                            <p>KCG Shop hợp tác với các đơn vị vận chuyển uy tín hàng đầu nhằm đảm bảo hàng hóa đến tay khách hàng nhanh chóng, an toàn và giữ nguyên chất lượng (đặc biệt là thực phẩm).</p>

                            <h3>1. Thời gian và Phí giao hàng</h3>

                            <h4>a. Giao hàng hỏa tốc (Khu vực Nội thành)</h4>
                            <ul>
                                <li><strong>Thời gian:</strong> Nhận hàng trong vòng 2 - 4 tiếng kể từ khi đặt hàng.</li>
                                <li><strong>Áp dụng:</strong> Các mặt hàng tươi sống, thực phẩm đông lạnh, hoặc khách hàng có nhu cầu cần gấp.</li>
                                <li><strong>Phí vận chuyển:</strong> {fee}đ/đơn.</li>
                            </ul>

                            <h4>b. Giao hàng tiêu chuẩn (Toàn quốc)</h4>
                            <ul>
                                <li><strong>Nội thành TP.HCM/Hà Nội:</strong> Giao trong 1-2 ngày làm việc. Phí {fee}đ.</li>
                                <li><strong>Ngoại thành và các Tỉnh/Thành khác:</strong> Giao trong 3-5 ngày làm việc. Phí có thể cao hơn tùy khu vực và khối lượng kiện hàng.</li>
                            </ul>

                            <h3>2. Chính sách đồng kiểm (Kiểm tra hàng)</h3>
                            <p>KCG Shop <strong>KHUYẾN KHÍCH</strong> khách hàng kiểm tra ngoại quan kiện hàng (tình trạng hộp, tem niêm phong) và kiểm đếm số lượng sản phẩm cùng nhân viên giao hàng trước khi thanh toán.</p>
                            <p><em>*Lưu ý: Đối với các sản phẩm có niêm phong (seal) của nhà sản xuất, khách hàng vui lòng không bóc seal trong quá trình đồng kiểm.</em></p>

                            <h3>3. Xử lý sự cố giao hàng</h3>
                            <p>Trong trường hợp thời tiết xấu hoặc sự cố bất khả kháng, thời gian giao hàng có thể bị chậm trễ. KCG Shop sẽ chủ động liên hệ thông báo. Mọi thắc mắc vui lòng gọi Hotline {hotline}.</p>
                        </>
                    );
                },
            },
            {
                title: "Chính sách đổi trả & Hoàn tiền",
                slug: "doi-tra-hoan-tien",
                content: (
                    <>
                        <h2>Chính Sách Đổi Trả & Hoàn Tiền</h2>
                        <p>Để đảm bảo quyền lợi tối đa cho người tiêu dùng, KCG Shop áp dụng chính sách đổi trả hàng hóa rõ ràng và linh hoạt.</p>

                        <h3>1. Điều kiện chấp nhận đổi/trả hàng</h3>
                        <ul>
                            <li>Sản phẩm giao không đúng loại, không đúng số lượng như trong đơn đặt hàng.</li>
                            <li>Sản phẩm bị lỗi do nhà sản xuất (hư hỏng bao bì, biến dạng, lỗi kỹ thuật).</li>
                            <li>Sản phẩm hết hạn sử dụng hoặc có dấu hiệu hư hỏng, ôi thiu lúc nhận hàng.</li>
                            <li>Sản phẩm còn nguyên vẹn tem mác, chưa qua sử dụng (trừ trường hợp khui ra mới phát hiện hư hỏng bên trong).</li>
                        </ul>

                        <h3>2. Thời gian áp dụng đổi trả</h3>
                        <ul>
                            <li><strong>Thực phẩm tươi sống, đông lạnh, hàng tiêu dùng ngắn hạn:</strong> Báo lỗi trong vòng <strong>24 giờ</strong> kể từ thời điểm nhận hàng thành công.</li>
                            <li><strong>Hàng bách hóa khô, đồ gia dụng, mỹ phẩm:</strong> Trong vòng <strong>7 ngày</strong> kể từ ngày nhận hàng.</li>
                        </ul>

                        <h3>3. Quy trình xử lý đổi trả & Hoàn tiền</h3>
                        <ol>
                            <li><strong>Bước 1:</strong> Khách hàng quay video/chụp ảnh tình trạng hàng hóa và gửi qua Zalo CSKH hoặc Email cskh@kcgshop.com.</li>
                            <li><strong>Bước 2:</strong> KCG Shop xác nhận tình trạng. Nếu hợp lệ, nhân viên bưu cục sẽ đến tận nơi thu hồi hàng hóa hoàn toàn miễn phí.</li>
                            <li><strong>Bước 3:</strong> KCG Shop gửi hàng đổi mới hoặc tiến hành hoàn tiền.</li>
                        </ol>

                        <h3>4. Thời gian và Phương thức hoàn tiền</h3>
                        <p>Tiền sẽ được hoàn qua Tài khoản Ngân hàng, Ví điện tử (VNPAY) hoặc Thẻ tín dụng gốc của quý khách. Thời gian hoàn tiền từ <strong>3 đến 5 ngày làm việc</strong> tùy thuộc vào hệ thống ngân hàng.</p>
                    </>
                ),
            },
            {
                title: "Chính sách bảo hành",
                slug: "chinh-sach-bao-hanh",
                content: (
                    <>
                        <h2>Chính Sách Bảo Hành</h2>
                        <p>KCG Shop cam kết phân phối các sản phẩm điện máy, gia dụng và phụ kiện công nghệ chính hãng 100%. Mọi sản phẩm đều được áp dụng chính sách bảo hành chuẩn của hãng sản xuất.</p>

                        <h3>1. Điều kiện được bảo hành miễn phí</h3>
                        <ul>
                            <li>Sản phẩm còn trong thời hạn bảo hành (Căn cứ vào hóa đơn mua hàng điện tử hoặc tem bảo hành trên sản phẩm).</li>
                            <li>Sản phẩm gặp sự cố kỹ thuật do lỗi của nhà sản xuất.</li>
                            <li>Số Serial/IMEI/Mã vạch trên sản phẩm phải còn nguyên vẹn, không có dấu hiệu cạo sửa, chắp vá.</li>
                        </ul>

                        <h3>2. Các trường hợp TỪ CHỐI bảo hành</h3>
                        <ul>
                            <li>Sản phẩm đã hết thời hạn bảo hành.</li>
                            <li>Hư hỏng do tác động vật lý (rơi vỡ, móp méo, trầy xước) hoặc do thiên tai, hỏa hoạn, côn trùng xâm nhập.</li>
                            <li>Sản phẩm bị vào nước hoặc sử dụng sai nguồn điện, sai hướng dẫn của nhà sản xuất.</li>
                            <li>Sản phẩm đã bị tự ý tháo dỡ, can thiệp hoặc đem đi sửa chữa tại các cơ sở không được ủy quyền.</li>
                        </ul>

                        <h3>3. Địa điểm bảo hành</h3>
                        <p>Quý khách có thể lựa chọn 1 trong 2 cách sau để yêu cầu bảo hành:</p>
                        <ul>
                            <li><strong>Cách 1: Gửi trực tiếp tại hãng.</strong> Khách hàng mang sản phẩm đến các Trung tâm bảo hành chính hãng của thương hiệu (Sony, Xiaomi, Philips...) gần nhất.</li>
                            <li><strong>Cách 2: Gửi thông qua KCG Shop.</strong> Khách hàng mang sản phẩm đến cửa hàng KCG Shop hoặc gửi bưu điện về kho trung tâm. Chúng tôi sẽ hỗ trợ chuyển sản phẩm đi bảo hành giúp quý khách. Thời gian xử lý thông thường từ 7 - 14 ngày làm việc.</li>
                        </ul>
                    </>
                ),
            },
        ],
    },
    {
        category: "Về KCG Shop",
        links: [
            {
                title: "Giới thiệu công ty",
                slug: "ve-chung-toi",
                content: (
                    <>
                        <h2>Giới Thiệu KCG Shop - Trọn Vẹn Tiện Ích, An Tâm Mua Sắm</h2>
                        <p>Được thành lập vào năm 2026, <strong>KCG Shop</strong> tự hào là hệ thống siêu thị mini và nền tảng thương mại điện tử thế hệ mới, chuyên cung cấp thực phẩm sạch, hàng tiêu dùng và đồ gia dụng thiết yếu cho mọi gia đình Việt.</p>

                        <h3>Tầm nhìn & Sứ mệnh</h3>
                        <ul>
                            <li><strong>Tầm nhìn:</strong> Trở thành chuỗi bán lẻ đa kênh (Omnichannel) được yêu thích nhất tại Việt Nam, mang đến trải nghiệm mua sắm liền mạch từ Online đến Offline.</li>
                            <li><strong>Sứ mệnh:</strong> Nâng cao chất lượng cuộc sống của người Việt thông qua việc cung cấp các sản phẩm 100% chính hãng, nguồn gốc rõ ràng, giá cả bình ổn và dịch vụ giao hàng siêu tốc.</li>
                        </ul>

                        <h3>Giá trị cốt lõi của KCG Shop</h3>
                        <ol>
                            <li><strong>Chất lượng ưu tiên:</strong> Mọi sản phẩm lên kệ đều trải qua quy trình kiểm định chất lượng khắt khe.</li>
                            <li><strong>Khách hàng là trọng tâm:</strong> Mọi quyết định và cải tiến hệ thống đều xuất phát từ nhu cầu và trải nghiệm của khách hàng.</li>
                            <li><strong>Tiện lợi tối đa:</strong> Tối ưu hóa giao diện web/app và mạng lưới kho hàng để việc mua sắm chỉ diễn ra trong vài cú chạm.</li>
                        </ol>
                        <p>KCG Shop không chỉ là nơi mua sắm, mà còn là người bạn đồng hành đáng tin cậy trong mọi bữa ăn và sinh hoạt gia đình bạn!</p>
                    </>
                ),
            },
            {
                title: "Tuyển dụng",
                slug: "tuyen-dung",
                content: (
                    <>
                        <h2>Cơ Hội Nghề Nghiệp Tại KCG Shop</h2>
                        <p>KCG Shop đang trong giai đoạn mở rộng thần tốc. Chúng tôi luôn tìm kiếm những người đồng đội nhiệt huyết, dám nghĩ dám làm để cùng nhau xây dựng hệ sinh thái bán lẻ hàng đầu.</p>

                        <h3>1. Các vị trí đang tuyển dụng</h3>
                        <ul>
                            <li><strong>Khối Cửa hàng & Kho vận:</strong> Cửa hàng trưởng, Nhân viên Thu ngân, Nhân viên Kho, Tài xế giao hàng nội bộ (Shipper).</li>
                            <li><strong>Khối Văn phòng:</strong> Chuyên viên Digital Marketing, Lập trình viên Fullstack (React/Spring Boot), Nhân viên Chăm sóc khách hàng (CSKH), Chuyên viên Thu mua.</li>
                        </ul>

                        <h3>2. Quyền lợi khi gia nhập KCG Shop</h3>
                        <ul>
                            <li>Mức lương cạnh tranh, xét tăng lương định kỳ 6 tháng/lần.</li>
                            <li>Thưởng KPI hàng tháng, thưởng tháng lương thứ 13 và các dịp Lễ/Tết.</li>
                            <li>Đầy đủ chế độ Bảo hiểm (BHXH, BHYT) theo quy định của pháp luật.</li>
                            <li>Môi trường làm việc GenZ trẻ trung, minh bạch, cấp trên luôn lắng nghe.</li>
                            <li>Chiết khấu đặc biệt lên tới 20% khi mua sắm tại hệ thống KCG Shop.</li>
                        </ul>

                        <h3>3. Cách thức ứng tuyển</h3>
                        <p>Hãy gửi CV (Sơ yếu lý lịch) của bạn về địa chỉ Email: <strong>tuyendung@kcgshop.com</strong></p>
                        <p>Tiêu đề email ghi rõ: <code>[Vị trí ứng tuyển] - [Họ và Tên của bạn]</code></p>
                        <p>Bộ phận Nhân sự sẽ liên hệ với các ứng viên phù hợp trong vòng 3-5 ngày làm việc.</p>
                    </>
                ),
            },
            {
                title: "Điều khoản sử dụng",
                slug: "dieu-khoan-su-dung",
                content: (
                    <>
                        <h2>Điều Khoản Sử Dụng Dịch Vụ</h2>
                        <p>Khi quý khách truy cập vào trang web KCG Shop để tham quan hoặc mua sắm, quý khách đã đồng ý tuân thủ các điều khoản và điều kiện dưới đây. Vui lòng đọc kỹ trước khi sử dụng dịch vụ.</p>

                        <h3>1. Trách nhiệm của Khách hàng</h3>
                        <ul>
                            <li>Quý khách phải đảm bảo đủ 18 tuổi, hoặc thực hiện giao dịch dưới sự giám sát của cha mẹ hay người giám hộ hợp pháp.</li>
                            <li>Quý khách có trách nhiệm cung cấp thông tin giao hàng chính xác và bảo mật thông tin tài khoản (username, password) của mình.</li>
                            <li>Nghiêm cấm các hành vi sử dụng công cụ tự động (bot, spider) để thu thập dữ liệu, can thiệp vào hệ thống máy chủ hoặc tạo đơn hàng ảo nhằm phá hoại KCG Shop.</li>
                        </ul>

                        <h3>2. Thông tin sản phẩm và Giá cả</h3>
                        <p>KCG Shop luôn cố gắng cung cấp thông tin chi tiết và giá cả chính xác nhất. Tuy nhiên, đôi lúc vẫn có thể xảy ra sai sót (ví dụ: lỗi hệ thống hiển thị sai giá). Trong trường hợp này, KCG Shop có quyền từ chối hoặc hủy đơn hàng của quý khách và sẽ liên hệ thông báo, hoàn tiền (nếu đã thanh toán) ngay lập tức.</p>

                        <h3>3. Quyền sở hữu trí tuệ</h3>
                        <p>Mọi nội dung trên website bao gồm văn bản, thiết kế, đồ họa, logo, biểu tượng, hình ảnh đều thuộc sở hữu của KCG Shop. Nghiêm cấm mọi hành vi sao chép, chỉnh sửa hoặc sử dụng cho mục đích thương mại mà không có sự cho phép bằng văn bản.</p>

                        <h3>4. Giải quyết tranh chấp</h3>
                        <p>Mọi tranh chấp phát sinh từ việc sử dụng dịch vụ hoặc mua hàng tại KCG Shop sẽ được ưu tiên giải quyết thông qua thương lượng, hòa giải. Nếu không đạt được thỏa thuận, vụ việc sẽ được đưa ra tòa án có thẩm quyền tại Việt Nam.</p>
                    </>
                ),
            },
            {
                title: "Chính sách bảo mật",
                slug: "chinh-sach-bao-mat",
                content: (
                    <>
                        <h2>Chính Sách Bảo Mật Thông Tin</h2>
                        <p>Sự riêng tư của dữ liệu cá nhân là vô cùng quan trọng. Tại KCG Shop, chúng tôi cam kết bảo vệ thông tin của bạn bằng các biện pháp an ninh nghiêm ngặt nhất.</p>

                        <h3>1. Mục đích thu thập thông tin</h3>
                        <p>KCG Shop chỉ thu thập các thông tin cần thiết khi quý khách tạo tài khoản hoặc đặt hàng, bao gồm: Họ tên, Số điện thoại, Email, Địa chỉ giao hàng. Các thông tin này được dùng để:</p>
                        <ul>
                            <li>Xử lý, giao nhận đơn hàng và xác nhận thanh toán.</li>
                            <li>Liên hệ hỗ trợ khi có sự cố giao hàng hoặc khiếu nại.</li>
                            <li>Gửi email thông báo về các chương trình khuyến mãi (chỉ khi quý khách đồng ý nhận tin).</li>
                        </ul>

                        <h3>2. Cam kết bảo mật dữ liệu</h3>
                        <ul>
                            <li>Dữ liệu của quý khách được mã hóa an toàn và lưu trữ trên hệ thống máy chủ bảo mật.</li>
                            <li>KCG Shop <strong>TUYỆT ĐỐI KHÔNG</strong> bán, trao đổi hay chia sẻ thông tin cá nhân của quý khách cho bất kỳ bên thứ ba nào vì mục đích thương mại.</li>
                            <li>Chúng tôi chỉ cung cấp thông tin (tên, số điện thoại, địa chỉ) cho đối tác vận chuyển (VD: VNPost, GHN) để thực hiện việc giao hàng.</li>
                        </ul>

                        <h3>3. Quyền lợi của khách hàng</h3>
                        <p>Quý khách có quyền đăng nhập vào tài khoản để chỉnh sửa thông tin cá nhân bất cứ lúc nào. Nếu quý khách muốn xóa hoàn toàn tài khoản và dữ liệu khỏi hệ thống KCG Shop, vui lòng gửi yêu cầu về email <strong>cskh@kcgshop.com</strong>, chúng tôi sẽ xử lý trong vòng 48 giờ.</p>
                    </>
                ),
            },
            {
                title: "Chương trình tiếp thị liên kết (Affiliate)",
                slug: "chuong-trinh-affiliate",
                content: (
                    <>
                        <h2>Chương Trình Affiliate KCG Shop - Kiếm Tiền Không Cần Vốn!</h2>
                        <p>Bạn là một Content Creator, Tiktoker, hay đơn giản là người yêu thích giới thiệu các sản phẩm chất lượng tới bạn bè? Tham gia ngay Chương trình Tiếp thị liên kết (Affiliate) của KCG Shop để biến sức ảnh hưởng của bạn thành thu nhập ổn định.</p>

                        <h3>1. Tại sao nên chọn Affiliate KCG Shop?</h3>
                        <ul>
                            <li><strong>Sản phẩm dễ bán:</strong> Nguồn hàng bách hóa, thực phẩm, gia dụng là nhu cầu thiết yếu hàng ngày, tỷ lệ chuyển đổi (mua hàng) cực kỳ cao.</li>
                            <li><strong>Hoa hồng hấp dẫn:</strong> Nhận chiết khấu từ <strong>5% đến 15%</strong> cho mỗi đơn hàng thành công, tùy thuộc vào ngành hàng.</li>
                            <li><strong>Lưu cookie 30 ngày:</strong> Khách hàng chỉ cần bấm vào link của bạn 1 lần, nếu họ quay lại mua hàng trong vòng 30 ngày tiếp theo, bạn vẫn nhận được hoa hồng.</li>
                        </ul>

                        <h3>2. Cách thức hoạt động</h3>
                        <ol>
                            <li><strong>Đăng ký:</strong> Điền form đăng ký đối tác (Phê duyệt tự động sau 24h).</li>
                            <li><strong>Lấy link:</strong> Chọn sản phẩm bất kỳ trên KCG Shop và tạo link theo dõi (Tracking link) riêng của bạn.</li>
                            <li><strong>Chia sẻ:</strong> Đăng link lên Facebook, Tiktok, Blog, Youtube hoặc gửi cho bạn bè.</li>
                            <li>
                                <strong>Nhận tiền:</strong> Khách mua hàng thành công -&gt; Hoa hồng được cộng vào Dashboard của bạn.
                            </li>                        </ol>

                        <h3>3. Chính sách thanh toán</h3>
                        <p>Doanh thu sẽ được đối soát vào ngày 10 hàng tháng. KCG Shop sẽ tự động chuyển khoản số tiền hoa hồng vào tài khoản ngân hàng của bạn nếu số dư đạt mức tối thiểu là <strong>200.000 VNĐ</strong>.</p>

                        <p>👉 <strong>Đăng ký trở thành Đối tác của KCG Shop ngay hôm nay để bắt đầu hành trình gia tăng thu nhập!</strong> (Vui lòng liên hệ Fanpage hoặc Email để nhận link đăng ký hệ thống).</p>
                    </>
                ),
            }
        ],
    },

];