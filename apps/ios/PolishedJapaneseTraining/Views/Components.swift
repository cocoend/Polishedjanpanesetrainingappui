import SwiftUI
import UIKit

struct AppHeader<Trailing: View>: View {
    let title: String
    let subtitle: String?
    let trailing: Trailing

    init(title: String, subtitle: String? = nil, @ViewBuilder trailing: () -> Trailing = { EmptyView() }) {
        self.title = title
        self.subtitle = subtitle
        self.trailing = trailing()
    }

    var body: some View {
        HStack(alignment: .top) {
            VStack(alignment: .leading, spacing: 6) {
                Text(title)
                    .font(.title2.bold())
                    .foregroundStyle(.primary)
                if let subtitle {
                    Text(subtitle)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
            }
            Spacer()
            trailing
        }
        .padding(.horizontal, 24)
        .padding(.top, 20)
        .padding(.bottom, 16)
    }
}

struct Pill: View {
    let text: String
    var color: Color = .green

    var body: some View {
        Text(text)
            .font(.caption.bold())
            .foregroundStyle(.white)
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(color, in: Capsule())
    }
}

struct SoftCard<Content: View>: View {
    var tint: Color = .green
    var cornerRadius: CGFloat = 24
    var borderWidth: CGFloat = 2
    var shadowRadius: CGFloat = 0
    var shadowYOffset: CGFloat = 0
    var content: Content

    init(
        tint: Color = .green,
        cornerRadius: CGFloat = 24,
        borderWidth: CGFloat = 2,
        shadowRadius: CGFloat = 0,
        shadowYOffset: CGFloat = 0,
        @ViewBuilder content: () -> Content
    ) {
        self.tint = tint
        self.cornerRadius = cornerRadius
        self.borderWidth = borderWidth
        self.shadowRadius = shadowRadius
        self.shadowYOffset = shadowYOffset
        self.content = content()
    }

    var body: some View {
        content
            .padding(20)
            .background(tint.opacity(0.10), in: RoundedRectangle(cornerRadius: cornerRadius, style: .continuous))
            .overlay {
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .stroke(tint.opacity(0.25), lineWidth: borderWidth)
            }
            .shadow(color: tint.opacity(shadowRadius > 0 ? 0.14 : 0), radius: shadowRadius, y: shadowYOffset)
    }
}

struct GradientSoftCard<Content: View>: View {
    var tint: Color = .green
    var endTint: Color? = nil
    var cornerRadius: CGFloat = 28
    var borderWidth: CGFloat = 2
    var content: Content

    init(
        tint: Color = .green,
        endTint: Color? = nil,
        cornerRadius: CGFloat = 28,
        borderWidth: CGFloat = 2,
        @ViewBuilder content: () -> Content
    ) {
        self.tint = tint
        self.endTint = endTint
        self.cornerRadius = cornerRadius
        self.borderWidth = borderWidth
        self.content = content()
    }

    var body: some View {
        content
            .padding(24)
            .background(
                LinearGradient(
                    colors: [tint.opacity(0.10), (endTint ?? tint).opacity(0.12)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                ),
                in: RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
            )
            .overlay {
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .stroke(tint.opacity(0.25), lineWidth: borderWidth)
            }
            .shadow(color: tint.opacity(0.14), radius: 8, y: 4)
    }
}

struct PrimaryButton: View {
    @Environment(\.isEnabled) private var isEnabled

    let title: String
    var icon: String?
    var color: Color = .green
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 10) {
                if let icon {
                    Image(systemName: icon)
                }
                Text(title)
            }
            .font(.headline)
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(isEnabled ? color : Color.gray.opacity(0.55), in: RoundedRectangle(cornerRadius: 18, style: .continuous))
            .shadow(color: isEnabled ? color.opacity(0.25) : .clear, radius: 10, y: 6)
        }
        .buttonStyle(.plain)
    }
}

struct ProcessingButton: View {
    let isProcessing: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 10) {
                if isProcessing {
                    ProgressView()
                        .tint(.white)
                        .controlSize(.small)
                } else {
                    Image(systemName: "paperplane.fill")
                }
                Text(isProcessing ? "AIフィードバック作成中" : "AIフィードバックを受ける")
            }
            .font(.headline)
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(isProcessing ? Color.blue : Color.green, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
            .shadow(color: (isProcessing ? Color.blue : Color.green).opacity(0.25), radius: 10, y: 6)
        }
        .buttonStyle(.plain)
        .disabled(isProcessing)
    }
}

struct MoreExplanationButton: View {
    let color: Color
    let action: () -> Void

    var body: some View {
        Button("もっと説明", action: action)
            .font(.caption.bold())
            .foregroundStyle(.white)
            .padding(.horizontal, 12)
            .padding(.vertical, 7)
            .background(color.gradient, in: Capsule())
            .shadow(color: color.opacity(0.25), radius: 8, y: 4)
            .buttonStyle(.plain)
    }
}

struct FlowPills: View {
    let items: [String]

    private let columns = [
        GridItem(.adaptive(minimum: 120), spacing: 8, alignment: .leading)
    ]

    var body: some View {
        LazyVGrid(columns: columns, alignment: .leading, spacing: 8) {
            ForEach(Array(items.enumerated()), id: \.offset) { index, item in
                Text(item)
                    .font(.caption.bold())
                    .foregroundStyle(foregroundColor(at: index))
                    .lineLimit(2)
                    .minimumScaleFactor(0.85)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 9)
                    .frame(maxWidth: .infinity)
                    .background(backgroundColor(at: index), in: Capsule())
                    .overlay {
                        Capsule()
                            .stroke(borderColor(at: index), lineWidth: 1)
                    }
            }
        }
    }

    private func foregroundColor(at index: Int) -> Color {
        [Color.orange, Color.pink, Color.purple][safe: index] ?? .gray
    }

    private func backgroundColor(at index: Int) -> Color {
        foregroundColor(at: index).opacity(0.14)
    }

    private func borderColor(at index: Int) -> Color {
        foregroundColor(at: index).opacity(0.24)
    }
}

struct InlinePill: View {
    let text: String
    var foreground: Color = .secondary
    var background: Color = .white

    var body: some View {
        Text(text)
            .font(.caption)
            .foregroundStyle(foreground)
            .lineLimit(1)
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(background, in: Capsule())
    }
}

struct SectionLabel: View {
    let text: String

    var body: some View {
        Text(text)
            .font(.caption.bold())
            .foregroundStyle(.secondary)
            .textCase(.uppercase)
    }
}

extension View {
    func stableVerticalScroll() -> some View {
        background(VerticalScrollBounceConfigurator())
    }
}

private struct VerticalScrollBounceConfigurator: UIViewRepresentable {
    func makeUIView(context: Context) -> UIView {
        let view = UIView(frame: .zero)
        configure(from: view)
        return view
    }

    func updateUIView(_ uiView: UIView, context: Context) {
        configure(from: uiView)
    }

    private func configure(from view: UIView) {
        DispatchQueue.main.async {
            guard let scrollView = view.enclosingScrollView else {
                return
            }

            scrollView.bounces = false
            scrollView.alwaysBounceVertical = false
        }
    }
}

private extension UIView {
    var enclosingScrollView: UIScrollView? {
        if let scrollView = self as? UIScrollView {
            return scrollView
        }

        return superview?.enclosingScrollView
    }
}

private extension Array {
    subscript(safe index: Int) -> Element? {
        indices.contains(index) ? self[index] : nil
    }
}
